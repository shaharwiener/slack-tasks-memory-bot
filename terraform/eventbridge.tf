# EventBridge rule for scheduled posts
resource "aws_cloudwatch_event_rule" "scheduled_posts" {
  name                = "${var.lambda_function_name}-scheduled-posts"
  description         = "Trigger scheduled task checklist posts"
  schedule_expression  = var.schedule_expression

  tags = {
    Name        = "${var.lambda_function_name}-scheduled-posts"
    Environment = "production"
    ManagedBy   = "terraform"
  }
}

# EventBridge target (Lambda function for scheduled posts)
resource "aws_cloudwatch_event_target" "scheduled_posts_target" {
  rule      = aws_cloudwatch_event_rule.scheduled_posts.name
  target_id = "${var.lambda_function_name}-scheduled-target"
  arn       = aws_lambda_function.scheduled.arn
}

# Lambda permission for EventBridge
resource "aws_lambda_permission" "eventbridge_invoke" {
  statement_id  = "AllowEventBridgeInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.scheduled.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.scheduled_posts.arn
}

