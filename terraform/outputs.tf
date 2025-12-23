output "dynamodb_tasks_table_name" {
  description = "Name of the DynamoDB tasks table"
  value       = aws_dynamodb_table.tasks.name
}

output "dynamodb_config_table_name" {
  description = "Name of the DynamoDB channel config table"
  value       = aws_dynamodb_table.channel_config.name
}

output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.bot.function_name
}

output "lambda_function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.bot.arn
}

output "lambda_scheduled_function_name" {
  description = "Name of the scheduled Lambda function"
  value       = aws_lambda_function.scheduled.function_name
}

output "function_url" {
  description = "Lambda Function URL (if enabled)"
  value       = var.enable_function_url ? aws_lambda_function_url.bot[0].function_url : null
}

output "api_gateway_url" {
  description = "API Gateway URL (if enabled)"
  value       = var.enable_api_gateway ? "${aws_apigatewayv2_api.bot_api[0].api_endpoint}/slack/events" : null
}

output "slack_request_url" {
  description = "URL to use as Slack app Request URL"
  value = var.enable_function_url ? aws_lambda_function_url.bot[0].function_url : (
    var.enable_api_gateway ? "${aws_apigatewayv2_api.bot_api[0].api_endpoint}/slack/events" : null
  )
}

output "eventbridge_rule_arn" {
  description = "ARN of the EventBridge rule for scheduled posts"
  value       = aws_cloudwatch_event_rule.scheduled_posts.arn
}

