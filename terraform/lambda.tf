# Archive the Lambda function code
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/.."
  output_path = "${path.module}/lambda-function.zip"
  
  excludes = [
    ".git",
    ".gitignore",
    "*.md",
    "terraform",
    "terraform/**",
    "*.db",
    "*.db-journal",
    ".env",
    ".env.*",
    "tasks.db",
    "node_modules/.cache",
    "node_modules/**/test",
    "node_modules/**/tests",
    "node_modules/**/*.md",
    "node_modules/**/*.txt"
  ]
}

# Lambda function for bot events
resource "aws_lambda_function" "bot" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = var.lambda_function_name
  role            = aws_iam_role.lambda_role.arn
  handler         = "lambda.handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime         = var.lambda_runtime
  timeout         = var.lambda_timeout
  memory_size     = var.lambda_memory_size

  environment {
    variables = {
      SLACK_BOT_TOKEN        = var.slack_bot_token
      SLACK_SIGNING_SECRET   = var.slack_signing_secret
      AWS_REGION             = var.aws_region
      DYNAMODB_TASKS_TABLE   = aws_dynamodb_table.tasks.name
      DYNAMODB_CONFIG_TABLE  = aws_dynamodb_table.channel_config.name
      DEFAULT_TZ             = var.default_tz
      DEFAULT_POST_HOURS     = var.default_post_hours
    }
  }

  tags = {
    Name        = var.lambda_function_name
    Environment = "production"
    ManagedBy   = "terraform"
  }
}

# Lambda function for scheduled posts
resource "aws_lambda_function" "scheduled" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "${var.lambda_function_name}-scheduled"
  role            = aws_iam_role.lambda_role.arn
  handler         = "lambda.scheduledHandler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime         = var.lambda_runtime
  timeout         = var.lambda_timeout
  memory_size     = var.lambda_memory_size

  environment {
    variables = {
      SLACK_BOT_TOKEN        = var.slack_bot_token
      SLACK_SIGNING_SECRET   = var.slack_signing_secret
      AWS_REGION             = var.aws_region
      DYNAMODB_TASKS_TABLE   = aws_dynamodb_table.tasks.name
      DYNAMODB_CONFIG_TABLE  = aws_dynamodb_table.channel_config.name
      DEFAULT_TZ             = var.default_tz
      DEFAULT_POST_HOURS     = var.default_post_hours
    }
  }

  tags = {
    Name        = "${var.lambda_function_name}-scheduled"
    Environment = "production"
    ManagedBy   = "terraform"
  }
}

