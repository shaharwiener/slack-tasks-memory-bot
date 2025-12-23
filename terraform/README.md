# Terraform Configuration for Slack Tasks Bot

This Terraform configuration provisions all AWS resources needed for the Slack Tasks Bot:

- **DynamoDB Tables**: `slack-tasks` and `slack-channel-config`
- **Lambda Functions**: Bot handler and scheduled posts handler
- **IAM Roles & Policies**: Permissions for Lambda to access DynamoDB
- **API Gateway or Function URL**: HTTP endpoint for Slack events
- **EventBridge Rule**: Scheduled trigger for posting checklists

## Prerequisites

1. **AWS CLI configured** with appropriate credentials
2. **Terraform installed** (>= 1.0)
3. **Node.js dependencies installed** in the project root:
   ```bash
   # From project root (not terraform directory)
   npm install --production
   ```
   
   **Note:** Terraform will package `node_modules` into the Lambda deployment package. Make sure to run `npm install --production` to exclude dev dependencies and reduce package size.

## Quick Start

1. **Copy the example variables file:**
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

2. **Edit `terraform.tfvars`** and fill in your values:
   ```hcl
   slack_bot_token      = "xoxb-your-actual-token"
   slack_signing_secret = "your-actual-signing-secret"
   aws_region           = "us-east-1"
   ```

3. **Initialize Terraform:**
   ```bash
   terraform init
   ```

4. **Review the plan:**
   ```bash
   terraform plan
   ```

5. **Apply the configuration:**
   ```bash
   terraform apply
   ```

6. **Get the Slack Request URL:**
   ```bash
   terraform output slack_request_url
   ```
   Use this URL in your Slack app's "Request URL" setting.

## Configuration Options

### Database Tables

- `dynamodb_tasks_table`: Name of the tasks table (default: `slack-tasks`)
- `dynamodb_config_table`: Name of the config table (default: `slack-channel-config`)

### Lambda Function

- `lambda_function_name`: Name of the Lambda function (default: `slack-tasks-bot`)
- `lambda_timeout`: Timeout in seconds (default: `60`)
- `lambda_memory_size`: Memory in MB (default: `1024`)
- `lambda_runtime`: Node.js runtime (default: `nodejs18.x`)

### HTTP Endpoint

Choose one:

- **Function URL** (simpler, recommended):
  ```hcl
  enable_function_url = true
  enable_api_gateway = false
  ```

- **API Gateway** (more features, better for production):
  ```hcl
  enable_function_url = false
  enable_api_gateway = true
  ```

### Scheduled Posts

- `schedule_expression`: EventBridge schedule (default: `rate(1 minute)`)
  - Examples:
    - `rate(1 minute)` - Every minute
    - `cron(* * * * ? *)` - Every minute (cron format)
    - `cron(0 * * * ? *)` - Every hour

## Outputs

After applying, you can view outputs:

```bash
# Get all outputs
terraform output

# Get specific output
terraform output slack_request_url
terraform output function_url
terraform output api_gateway_url
```

## Updating the Lambda Function

When you update your code:

1. **Update the code** in the project root
2. **Re-run Terraform:**
   ```bash
   terraform apply
   ```

Terraform will automatically detect code changes and update the Lambda function.

## Destroying Resources

To remove all resources:

```bash
terraform destroy
```

**Warning:** This will delete all DynamoDB tables and data!

## File Structure

```
terraform/
├── main.tf              # Provider configuration
├── variables.tf         # Input variables
├── dynamodb.tf          # DynamoDB tables
├── iam.tf               # IAM roles and policies
├── lambda.tf            # Lambda functions
├── function_url.tf      # Lambda Function URL (optional)
├── api_gateway.tf      # API Gateway (optional)
├── eventbridge.tf       # EventBridge rule for scheduling
├── outputs.tf           # Output values
├── terraform.tfvars     # Your variable values (not in git)
└── terraform.tfvars.example  # Example variables file
```

## Troubleshooting

### "Module not found" errors
- Ensure you've run `npm install` in the project root
- Terraform packages the entire project directory

### "Access denied" errors
- Check your AWS credentials: `aws sts get-caller-identity`
- Ensure your IAM user/role has permissions to create Lambda, DynamoDB, IAM, etc.

### Lambda timeout errors
- Increase `lambda_timeout` in `terraform.tfvars`
- Check CloudWatch logs for specific errors

### Function URL not working
- Verify the URL is correct: `terraform output function_url`
- Check Lambda function logs in CloudWatch
- Ensure Slack app Request URL matches the Function URL

## Cost Considerations

- **DynamoDB**: Pay-per-request (on-demand) - see `../DATABASE_COST_ANALYSIS.md`
- **Lambda**: Pay per invocation and compute time
- **API Gateway**: Pay per API call (if using API Gateway)
- **EventBridge**: Free for custom events (scheduled rules)

Estimated monthly cost: ~$3-40 for small-medium usage.

