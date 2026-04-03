module "dynamodb" {
  source     = "../../modules/dynamodb"
  table_name = "work-orders-dev"

  tags = {
    Environment = "dev"
    Owner       = "Frank"
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
  filename = "${path.root}/../../services/workorder-processor/target/workorder_processor.jar"
}

data "aws_iam_policy_document" "developer_passrole_policy" {
  statement {
    effect = "Allow"

    actions = [
      "iam:PassRole"
    ]

    resources = [
      module.lambda_role.arn
    ]
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
}

resource "aws_iam_policy" "developer_lambda_policy" {
  name   = "developer-lambda-passrole-dev"
  policy = data.aws_iam_policy_document.developer_passrole_policy.json
}


resource "aws_iam_group_policy_attachment" "attach_dev_group_policy" {
  group      = "DevGroup"
  policy_arn = aws_iam_policy.developer_lambda_policy.arn
}