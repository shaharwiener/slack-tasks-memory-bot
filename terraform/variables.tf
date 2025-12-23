variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "slack_bot_token" {
  description = "Slack bot token"
  type        = string
  sensitive   = true
}

variable "slack_signing_secret" {
  description = "Slack app signing secret"
  type        = string
  sensitive   = true
}

variable "dynamodb_tasks_table" {
  description = "DynamoDB table name for tasks"
  type        = string
  default     = "slack-tasks"
}

variable "dynamodb_config_table" {
  description = "DynamoDB table name for channel config"
  type        = string
  default     = "slack-channel-config"
}

variable "default_tz" {
  description = "Default timezone"
  type        = string
  default     = "Asia/Jerusalem"
}

variable "default_post_hours" {
  description = "Default posting hours (comma-separated)"
  type        = string
  default     = "9,13,17"
}

variable "lambda_function_name" {
  description = "Name of the Lambda function"
  type        = string
  default     = "slack-tasks-bot"
}

variable "lambda_timeout" {
  description = "Lambda function timeout in seconds"
  type        = number
  default     = 60
}

variable "lambda_memory_size" {
  description = "Lambda function memory size in MB"
  type        = number
  default     = 1024
}

variable "lambda_runtime" {
  description = "Lambda runtime"
  type        = string
  default     = "nodejs18.x"
}

variable "enable_function_url" {
  description = "Enable Lambda Function URL (alternative to API Gateway)"
  type        = bool
  default     = true
}

variable "enable_api_gateway" {
  description = "Enable API Gateway (alternative to Function URL)"
  type        = bool
  default     = false
}

variable "schedule_expression" {
  description = "EventBridge schedule expression for scheduled posts"
  type        = string
  default     = "rate(1 minute)"
}

