resource "aws_lambda_function" "this" {

  function_name = var.function_name
  role          = var.role_arn
  handler       = var.handler
  runtime       = var.runtime

  filename         = var.filename
  source_code_hash = filebase64sha256(var.filename)

  timeout     = 12
  memory_size = 512

  environment {
    variables = var.environment_variables
  }


  # lifecycle {
  #   ignore_changes = [
  #     filename,
  #     source_code_hash
  #   ]
  # }
}