module "dynamodb" {
  source     = "../../modules/dynamodb"
  table_name = "work-orders-dev"

  tags = {
    Environment = "dev"
    Owner       = "Frank"
  }
}

module "sqs" {
  source = "../../modules/sqs"

  name = "work-order-queue-dev"

  tags = {
    Project = "SeniorDesign"
    Env     = "dev"
  }
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
      "arn:aws:lambda:us-east-1:318942626726:function:workorder-processor-dev"
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
    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
    "arn:aws:iam::aws:policy/service-role/AWSLambdaSQSQueueExecutionRole"
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
    WORK_ORDERS_TABLE_NAME = module.dynamodb.table_name
    SES_FROM_EMAIL         = "frank.e.peraza@gmail.com"
    SES_TO_EMAIL           = "jmcken19@charlotte.edu" # Change demo email later for now frank -> frank email 
  }
}

resource "aws_lambda_event_source_mapping" "sqs_trigger" {
  event_source_arn = module.sqs.queue_arn
  function_name    = module.lambda_function.function_arn

  batch_size = 1
  enabled    = true
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

data "aws_iam_policy_document" "lambda_dynamodb_policy_doc" {
  statement {
    effect = "Allow"

    actions = [
      "dynamodb:PutItem",
      "dynamodb:GetItem",
      "dynamodb:UpdateItem"
    ]

    resources = [
      module.dynamodb.table_arn
    ]
  }
}

resource "aws_iam_policy" "lambda_dynamodb_policy" {
  name   = "workorder-lambda-dynamodb-dev"
  policy = data.aws_iam_policy_document.lambda_dynamodb_policy_doc.json
}

resource "aws_iam_role_policy_attachment" "attach_lambda_dynamodb_policy" {
  role       = module.lambda_role.name
  policy_arn = aws_iam_policy.lambda_dynamodb_policy.arn
}

data "aws_iam_policy_document" "lambda_ses_policy_doc" {
  statement {
    effect = "Allow"

    actions = [
      "ses:SendEmail",
      "ses:SendRawEmail"
    ]

    resources = ["*"]
  }
}

resource "aws_iam_policy" "lambda_ses_policy" {
  name   = "workorder-lambda-ses-dev"
  policy = data.aws_iam_policy_document.lambda_ses_policy_doc.json
}

resource "aws_iam_role_policy_attachment" "attach_lambda_ses_policy" {
  role       = module.lambda_role.name
  policy_arn = aws_iam_policy.lambda_ses_policy.arn
}