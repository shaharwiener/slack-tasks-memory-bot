# DynamoDB table for tasks
resource "aws_dynamodb_table" "tasks" {
  name           = var.dynamodb_tasks_table
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "pk"
  range_key      = "sk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }

  tags = {
    Name        = "Slack Tasks Bot - Tasks"
    Environment = "production"
    ManagedBy   = "terraform"
  }
}

# DynamoDB table for channel configuration
resource "aws_dynamodb_table" "channel_config" {
  name           = var.dynamodb_config_table
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "pk"
  range_key      = "sk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }

  tags = {
    Name        = "Slack Tasks Bot - Channel Config"
    Environment = "production"
    ManagedBy   = "terraform"
  }
}

