output "dynamodb_table_name" {
  value = module.dynamodb.table_name
}

output "dynamodb_table_arn" {
  value = module.dynamodb.table_arn
}

output "work_order_events_topic_arn" {
  value = aws_sns_topic.work_order_events.arn
}

output "notifications_table_name" {
  value = aws_dynamodb_table.notifications.name
}

output "notification_fanout_function_name" {
  value = module.notification_fanout_lambda.function_name
}

output "notification_api_endpoint" {
  value = module.notification_api_gateway.api_endpoint
}

output "users_table_name" {
  value = aws_dynamodb_table.users.name
}

output "auth_api_endpoint" {
  value = module.auth_api_gateway.api_endpoint
}