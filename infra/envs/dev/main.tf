module "dynamodb" {
  source     = "../../modules/dynamodb"
  table_name = "work-orders-dev"

  tags = {
    Environment = "dev"
    Owner       = "Frank"
  }
}

# SNS topic for work order events. The workorder-processor Lambda publishes
# here whenever a work order is created or its status changes. Subscribers
# (email for demo, fanout Lambda for storing notifications) receive each event.
resource "aws_sns_topic" "work_order_events" {
  name = "work-order-events-dev"
}

# Optional email subscription used for demoing/debugging the publish path.
# Only created when var.notification_email is set. The recipient must click
# the AWS confirmation email before SNS will deliver messages to them.
resource "aws_sns_topic_subscription" "work_order_events_email" {
  count     = var.notification_email == "" ? 0 : 1
  topic_arn = aws_sns_topic.work_order_events.arn
  protocol  = "email"
  endpoint  = var.notification_email
}

data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }

}

data "aws_iam_policy_document" "deploy_lambda_policy_doc" {
  statement {
    effect = "Allow"

    actions = [
      "lambda:GetFunction",
      "lambda:UpdateFunctionCode"
    ]

    resources = [
      "arn:aws:lambda:us-east-1:318942626726:function:workorder-processor-dev",
      "arn:aws:lambda:us-east-1:318942626726:function:notification-fanout-dev",
      "arn:aws:lambda:us-east-1:318942626726:function:notification-api-dev",
      "arn:aws:lambda:us-east-1:318942626726:function:auth-service-dev"
    ]
  }
}

resource "aws_iam_policy" "deploy_lambda_policy" {
  name   = "deploy-lambda-policy"
  policy = data.aws_iam_policy_document.deploy_lambda_policy_doc.json
}

resource "aws_iam_role_policy_attachment" "attach_deploy_lambda_policy" {
  role       = aws_iam_role.deploy_to_staging.name
  policy_arn = aws_iam_policy.deploy_lambda_policy.arn
}


data "aws_iam_policy_document" "staging_workorder_lambda_assume_role" {
  statement {
    effect = "Allow"

    actions = [
      "sts:AssumeRoleWithWebIdentity"
    ]

    principals {
      type = "Federated"
      identifiers = [
        "arn:aws:iam::318942626726:oidc-provider/token.actions.githubusercontent.com"
      ]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:Darkpenguin1/Senior-Design:ref:refs/heads/main"]
    }
  }
}

resource "aws_iam_role" "deploy_to_staging" {
  name = "deploy-to-staging"

  assume_role_policy = data.aws_iam_policy_document.staging_workorder_lambda_assume_role.json
}


module "lambda_role" {
  source = "../../modules/iam-role"

  name               = "workorder-processor-role-dev"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json

  policy_arns = [
    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  ]
}

module "lambda_function" {
  source = "../../modules/lambda"

  function_name = "workorder-processor-dev"
  role_arn      = module.lambda_role.arn

  handler  = "handler.Handler::handleRequest"
  runtime  = "java21"
  filename = "${path.root}/../../../services/workorder-processor/target/workorder_processor.jar"

  environment_variables = {
    SNS_TOPIC_ARN = aws_sns_topic.work_order_events.arn
  }
}

# Allow the workorder-processor Lambda to publish to the work-order-events SNS
# topic. Attached as an inline policy to the existing execution role so we
# don't need to create and manage a separate managed policy.
data "aws_iam_policy_document" "workorder_processor_sns_publish" {
  statement {
    effect    = "Allow"
    actions   = ["sns:Publish"]
    resources = [aws_sns_topic.work_order_events.arn]
  }
}

resource "aws_iam_role_policy" "workorder_processor_sns_publish" {
  name   = "workorder-processor-sns-publish"
  role   = module.lambda_role.name
  policy = data.aws_iam_policy_document.workorder_processor_sns_publish.json
}

# ---------------------------------------------------------------------------
# Notifications storage + fanout Lambda
# ---------------------------------------------------------------------------

# Notifications table. Defined directly (not via the dynamodb module) because
# the module is hardcoded to the work-orders schema. The GSI lets us query by
# role (e.g. all student-facing notifications) ordered by createdAt.
resource "aws_dynamodb_table" "notifications" {
  name         = "notifications-dev"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "notification_id"

  attribute {
    name = "notification_id"
    type = "S"
  }

  attribute {
    name = "role"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }

  global_secondary_index {
    name            = "role-createdAt-index"
    hash_key        = "role"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  tags = {
    Environment = "dev"
    ManagedBy   = "Terraform"
  }
}

# IAM role for the fanout Lambda. Basic execution + write access to the
# notifications table.
module "notification_fanout_role" {
  source = "../../modules/iam-role"

  name               = "notification-fanout-role-dev"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json

  policy_arns = [
    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  ]
}

data "aws_iam_policy_document" "notification_fanout_dynamodb" {
  statement {
    effect = "Allow"
    actions = [
      "dynamodb:PutItem",
      "dynamodb:Query",
      "dynamodb:GetItem"
    ]
    resources = [
      aws_dynamodb_table.notifications.arn,
      "${aws_dynamodb_table.notifications.arn}/index/*"
    ]
  }
}

resource "aws_iam_role_policy" "notification_fanout_dynamodb" {
  name   = "notification-fanout-dynamodb"
  role   = module.notification_fanout_role.name
  policy = data.aws_iam_policy_document.notification_fanout_dynamodb.json
}

module "notification_fanout_lambda" {
  source = "../../modules/lambda"

  function_name = "notification-fanout-dev"
  role_arn      = module.notification_fanout_role.arn

  handler  = "handler.NotificationHandler::handleRequest"
  runtime  = "java21"
  filename = "${path.root}/../../../services/notification-service/target/notification_service.jar"

  environment_variables = {
    NOTIFICATIONS_TABLE = aws_dynamodb_table.notifications.name
  }
}

# Subscribe the fanout Lambda to the work-order-events SNS topic.
resource "aws_sns_topic_subscription" "fanout_lambda" {
  topic_arn = aws_sns_topic.work_order_events.arn
  protocol  = "lambda"
  endpoint  = module.notification_fanout_lambda.function_arn
}

# Allow SNS to invoke the fanout Lambda.
resource "aws_lambda_permission" "allow_sns_invoke_fanout" {
  statement_id  = "AllowSNSInvokeFanout"
  action        = "lambda:InvokeFunction"
  function_name = module.notification_fanout_lambda.function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.work_order_events.arn
}

# ---------------------------------------------------------------------------
# Read API: API Gateway HTTP API + Lambda using the same notification-service
# JAR but a different handler class (NotificationApiHandler).
# ---------------------------------------------------------------------------

module "notification_api_lambda" {
  source = "../../modules/lambda"

  function_name = "notification-api-dev"
  role_arn      = module.notification_fanout_role.arn

  handler  = "handler.NotificationApiHandler::handleRequest"
  runtime  = "java21"
  filename = "${path.root}/../../../services/notification-service/target/notification_service.jar"

  environment_variables = {
    NOTIFICATIONS_TABLE = aws_dynamodb_table.notifications.name
  }
}

module "notification_api_gateway" {
  source = "../../modules/api-gateway"

  api_name             = "notification-api-dev"
  lambda_invoke_arn    = module.notification_api_lambda.invoke_arn
  lambda_function_name = module.notification_api_lambda.function_name
}

# ---------------------------------------------------------------------------
# Auth service: DynamoDB users table + Lambda + API Gateway
# ---------------------------------------------------------------------------

resource "aws_dynamodb_table" "users" {
  name         = "users-dev"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "user_id"

  attribute {
    name = "user_id"
    type = "S"
  }

  attribute {
    name = "email"
    type = "S"
  }

  global_secondary_index {
    name            = "email-index"
    hash_key        = "email"
    projection_type = "ALL"
  }

  tags = {
    Environment = "dev"
    ManagedBy   = "Terraform"
  }
}

module "auth_lambda_role" {
  source = "../../modules/iam-role"

  name               = "auth-service-role-dev"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json

  policy_arns = [
    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  ]
}

data "aws_iam_policy_document" "auth_dynamodb" {
  statement {
    effect = "Allow"
    actions = [
      "dynamodb:PutItem",
      "dynamodb:GetItem",
      "dynamodb:Query"
    ]
    resources = [
      aws_dynamodb_table.users.arn,
      "${aws_dynamodb_table.users.arn}/index/*"
    ]
  }
}

resource "aws_iam_role_policy" "auth_dynamodb" {
  name   = "auth-service-dynamodb"
  role   = module.auth_lambda_role.name
  policy = data.aws_iam_policy_document.auth_dynamodb.json
}

module "auth_lambda" {
  source = "../../modules/lambda"

  function_name = "auth-service-dev"
  role_arn      = module.auth_lambda_role.arn

  handler  = "handler.AuthApiHandler::handleRequest"
  runtime  = "java21"
  filename = "${path.root}/../../../services/auth-service/target/auth_service.jar"

  environment_variables = {
    USERS_TABLE = aws_dynamodb_table.users.name
    JWT_SECRET  = var.jwt_secret
  }

  timeout     = 15
  memory_size = 512
}

module "auth_api_gateway" {
  source = "../../modules/api-gateway"

  api_name             = "auth-api-dev"
  lambda_invoke_arn    = module.auth_lambda.invoke_arn
  lambda_function_name = module.auth_lambda.function_name
}

data "aws_iam_policy_document" "developer_passrole_policy" {
  statement {
    effect = "Allow"

    actions = [
      "iam:PassRole"
    ]

    resources = ["*"]
  }

  statement {
    effect = "Allow"

    actions = [
      "lambda:CreateFunction",
      "lambda:UpdateFunctionCode",
      "lambda:UpdateFunctionConfiguration",
      "lambda:GetFunction",
      "lambda:ListFunctions"
    ]

    resources = ["*"]
  }

  statement {
    effect = "Allow"

    actions = [
      "iam:CreateRole",
      "iam:GetRole",
      "iam:AttachRolePolicy",
      "iam:PutRolePolicy",
      "iam:TagRole"
    ]

    resources = ["*"]
  }
}

resource "aws_iam_policy" "developer_lambda_policy" {
  name   = "developer-lambda-passrole-dev"
  policy = data.aws_iam_policy_document.developer_passrole_policy.json
}


resource "aws_iam_group_policy_attachment" "attach_dev_group_policy" {
  group      = "DevGroup"
  policy_arn = aws_iam_policy.developer_lambda_policy.arn
}