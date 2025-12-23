# API Gateway (if enabled instead of Function URL)
resource "aws_apigatewayv2_api" "bot_api" {
  count = var.enable_api_gateway ? 1 : 0

  name          = "${var.lambda_function_name}-api"
  protocol_type = "HTTP"
  description   = "API Gateway for Slack Tasks Bot"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["POST", "OPTIONS"]
    allow_headers = ["content-type"]
  }

  tags = {
    Name        = "${var.lambda_function_name}-api"
    Environment = "production"
    ManagedBy   = "terraform"
  }
}

# API Gateway integration with Lambda
resource "aws_apigatewayv2_integration" "bot_integration" {
  count = var.enable_api_gateway ? 1 : 0

  api_id           = aws_apigatewayv2_api.bot_api[0].id
  integration_type = "AWS_PROXY"

  integration_method   = "POST"
  integration_uri      = aws_lambda_function.bot.invoke_arn
  payload_format_version = "2.0"
}

# API Gateway route
resource "aws_apigatewayv2_route" "bot_route" {
  count = var.enable_api_gateway ? 1 : 0

  api_id    = aws_apigatewayv2_api.bot_api[0].id
  route_key = "POST /slack/events"
  target    = "integrations/${aws_apigatewayv2_integration.bot_integration[0].id}"
}

# API Gateway stage
resource "aws_apigatewayv2_stage" "bot_stage" {
  count = var.enable_api_gateway ? 1 : 0

  api_id      = aws_apigatewayv2_api.bot_api[0].id
  name        = "$default"
  auto_deploy = true

  tags = {
    Name        = "${var.lambda_function_name}-stage"
    Environment = "production"
    ManagedBy   = "terraform"
  }
}

# Lambda permission for API Gateway
resource "aws_lambda_permission" "api_gateway_invoke" {
  count = var.enable_api_gateway ? 1 : 0

  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.bot.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.bot_api[0].execution_arn}/*/*"
}

