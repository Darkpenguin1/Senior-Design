module "dynamodb" {
  source     = "../../modules/dynamodb"
  table_name = "work-orders-dev"

  tags = {
    Environment = "dev"
    Owner       = "Frank"
  }
}

data "aws_vpc" "default" {
  default = true
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
  }                                                   # jmcken19@charlotte.edu
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


module "ecr" {
  source = "../../modules/ecr"

  name = "ticketing-service"
}

module "ecs_cluster" {
  source = "../../modules/ecs-cluster"

  name = "ticketing-cluster-dev"
}

module "ecs_service" {
  source = "../../modules/ecs-service"

  name              = "ticketing-service-dev"
  cluster_id        = module.ecs_cluster.id
  image             = "318942626726.dkr.ecr.us-east-1.amazonaws.com/ticketing-service:v11" # REMEMBER TO UPDATE THIS MANUALLY AHHHHHHHHHHHHHH
  container_port    = 8080
  aws_region        = "us-east-1"
  subnet_ids        = var.app_subnet_ids
  security_group_id = module.security_groups.ecs_service_sg_id
  target_group_arn  = module.alb.target_group_arn

  environment = {
    SPRING_DATASOURCE_URL      = "jdbc:postgresql://${module.rds_postgres.endpoint}:5432/ticketing_db"
    SPRING_DATASOURCE_USERNAME = "postgres"
    SPRING_DATASOURCE_PASSWORD = var.db_password
    WORK_ORDER_QUEUE_URL       = module.sqs.queue_url
    AWS_S3_BUCKET              = module.ticket_images_bucket.bucket_name
    AWS_REGION                 = "us-east-1"
    AWS_CDN_URL                = module.cdn.distribution_domain_name
  }
}
module "db_subnet_group" {
  source = "../../modules/db-subnet-group"

  name       = "ticketing-db-subnet-group-dev"
  subnet_ids = var.db_subnet_ids
}

module "security_groups" {
  source = "../../modules/security-groups"

  name              = "ticketing-dev"
  vpc_id            = data.aws_vpc.default.id
  app_port          = 8080
  app_ingress_cidrs = ["0.0.0.0/0"]
}

module "rds_postgres" {
  source = "../../modules/rds-postgres"

  identifier           = "ticketing-db-dev"
  db_name              = "ticketing_db"
  username             = "postgres"
  password             = var.db_password
  db_subnet_group_name = module.db_subnet_group.name
  security_group_id    = module.security_groups.rds_sg_id

  instance_class      = "db.t3.micro"
  engine_version      = "16.3"
  publicly_accessible = false
}

module "alb" {
  source = "../../modules/alb"

  name                  = "ticketing-alb-dev"
  target_group_name     = "ticketing-tg-dev"
  vpc_id                = data.aws_vpc.default.id
  subnet_ids            = var.app_subnet_ids
  alb_security_group_id = module.security_groups.alb_sg_id
  target_port           = 8080
  health_check_path     = "/api/health"
}

module "cdn" {
  source = "../../modules/cdn"

  comment             = "pickfix-cloudfront"
  default_root_object = "index.html"
  price_class         = "PriceClass_All"
  is_ipv6_enabled     = true

  # Frontend bucket
  origin_domain_name       = "pickfix-uncc-spring-2026.s3.amazonaws.com"
  origin_id                = "pickfix-uncc-spring-2026.s3.amazonaws.com-mnxdyf4aunv"
  origin_access_control_id = "E3SA6NA5TCMR8X"

  # API backend
  alb_domain_name = module.alb.alb_dns_name
  alb_origin_id   = "ticketing-alb-origin"

  # Uploads bucket
  uploads_origin_domain_name       = module.ticket_images_bucket.bucket_regional_domain_name
  uploads_origin_id                = "ticket-images-origin"
  uploads_origin_access_control_id = "E3SA6NA5TCMR8X"

  tags = {
    Name = "pickfix-cloudfront"
  }
}


data "aws_iam_policy_document" "ecs_sqs_policy_doc" {
  statement {
    effect = "Allow"

    actions = [
      "sqs:SendMessage"
    ]

    resources = [
      module.sqs.queue_arn
    ]
  }
}

resource "aws_iam_policy" "ecs_sqs_policy" {
  name   = "ecs-sqs-policy-dev"
  policy = data.aws_iam_policy_document.ecs_sqs_policy_doc.json
}

resource "aws_iam_role_policy_attachment" "ecs_sqs_attach" {
  role       = module.ecs_service.task_role_name
  policy_arn = aws_iam_policy.ecs_sqs_policy.arn
}

module "ticket_images_bucket" {
  source      = "../../modules/s3"
  bucket_name = "pickfix-ticket-images-dev-318942626726"

  tags = {
    Project = "SeniorDesign"
    Env     = "dev"
  }
}

data "aws_iam_policy_document" "ecs_s3_upload_policy_doc" {
  statement {
    effect = "Allow"

    actions = [
      "s3:PutObject"
    ]

    resources = [
      "${module.ticket_images_bucket.bucket_arn}/*"
    ]
  }
}

resource "aws_iam_policy" "ecs_s3_upload_policy" {
  name   = "ecs-s3-upload-policy-dev"
  policy = data.aws_iam_policy_document.ecs_s3_upload_policy_doc.json
}

resource "aws_iam_role_policy_attachment" "ecs_s3_upload_attach" {
  role       = module.ecs_service.task_role_name
  policy_arn = aws_iam_policy.ecs_s3_upload_policy.arn
}
resource "aws_s3_bucket_policy" "ticket_images_policy" {
  bucket = module.ticket_images_bucket.bucket_id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontRead"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${module.ticket_images_bucket.bucket_arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = module.cdn.distribution_arn
          }
        }
      }
    ]
  })
}