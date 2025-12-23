# Lambda Function URL for bot (if enabled)
resource "aws_lambda_function_url" "bot" {
  count = var.enable_function_url ? 1 : 0

  function_name      = aws_lambda_function.bot.function_name
  authorization_type = "NONE" # Use AWS_IAM for production

  cors {
    allow_credentials = false
    allow_origins     = ["*"]
    allow_methods     = ["POST"]
    allow_headers     = ["content-type"]
    expose_headers     = []
    max_age           = 0
  }
}

