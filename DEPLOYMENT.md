# Deployment Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure `.env` file:**
   ```env
   SLACK_BOT_TOKEN=xoxb-your-token
   SLACK_SIGNING_SECRET=your-signing-secret
   PORT=3000
   DEFAULT_TZ=Asia/Jerusalem
   DEFAULT_POST_HOURS=9,13,17
   ```

3. **Run locally:**
   ```bash
   node app.js
   ```

---

## Local Deployment (SQLite + Node.js)

### Database: SQLite
- **Automatic**: SQLite is used automatically for local development
- **Storage**: Creates `tasks.db` file in the project directory
- **No setup required**: Database is created automatically on first run

### Service: Node.js Application

**Prerequisites:** None

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure `.env` file:**
   ```env
   SLACK_BOT_TOKEN=xoxb-your-token
   SLACK_SIGNING_SECRET=your-signing-secret
   PORT=3000
   DEFAULT_TZ=Asia/Jerusalem
   DEFAULT_POST_HOURS=9,13,17
   ```

3. **Run the bot:**
   ```bash
   node app.js
   ```

4. **Verify it's running:**
   - You should see: `⚡️ Bot running on port 3000`
   - The bot will create `tasks.db` automatically
   - Configure your Slack app's Request URL to point to your server (e.g., `http://your-server:3000/slack/events`)

**Features:**
- ✅ SQLite database (local file, no external dependencies)
- ✅ Cron scheduler runs automatically (posts checklists at configured hours)
- ✅ No AWS setup required
- ✅ Perfect for development and testing

---

## AWS Lambda Deployment (DynamoDB + Lambda)

### Database: DynamoDB
- **Automatic**: DynamoDB is used automatically in Lambda (detected via `AWS_LAMBDA_FUNCTION_NAME`)
- **Storage**: AWS DynamoDB tables (serverless, managed)
- **Setup required**: Tables must be created before deployment

### Service: AWS Lambda

**Prerequisites:**
- AWS account with appropriate permissions
- AWS CLI configured (`aws configure`)
- Slack app configured

### Step 1: Create DynamoDB Tables

**Option A: Using the provided script (Recommended)**
```bash
# Set AWS region (optional, defaults to us-east-1)
export AWS_REGION=us-east-1

# Run the script
node scripts/create-dynamodb-tables.js
```

**Option B: Using AWS Console**
1. Go to [DynamoDB Console](https://console.aws.amazon.com/dynamodb/)
2. Click "Create table"
3. Create `slack-tasks`:
   - Partition key: `pk` (String)
   - Sort key: `sk` (String)
   - Billing mode: On-demand
4. Create `slack-channel-config`:
   - Partition key: `pk` (String)
   - Sort key: `sk` (String)
   - Billing mode: On-demand

**Option C: Using AWS CLI**
```bash
# Create tasks table
aws dynamodb create-table \
  --table-name slack-tasks \
  --attribute-definitions \
    AttributeName=pk,AttributeType=S \
    AttributeName=sk,AttributeType=S \
  --key-schema \
    AttributeName=pk,KeyType=HASH \
    AttributeName=sk,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Create config table
aws dynamodb create-table \
  --table-name slack-channel-config \
  --attribute-definitions \
    AttributeName=pk,AttributeType=S \
    AttributeName=sk,AttributeType=S \
  --key-schema \
    AttributeName=pk,KeyType=HASH \
    AttributeName=sk,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### Step 2: Set Up IAM Permissions

Your Lambda execution role needs DynamoDB permissions. Add this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/slack-tasks",
        "arn:aws:dynamodb:*:*:table/slack-tasks/*",
        "arn:aws:dynamodb:*:*:table/slack-channel-config",
        "arn:aws:dynamodb:*:*:table/slack-channel-config/*"
      ]
    }
  ]
}
```

### Step 3: Package and Deploy Lambda Function

1. **Package your Lambda function:**
   ```bash
   npm install --production
   zip -r function.zip . \
     -x "*.git*" \
     -x "node_modules/.cache/*" \
     -x "*.db" \
     -x "*.db-journal" \
     -x ".env*"
   ```

2. **Create Lambda function** (via AWS Console or CLI):
   - **Runtime**: Node.js 18.x or later
   - **Handler**: `lambda.handler`
   - **Timeout**: At least 30 seconds (recommended: 60 seconds)
   - **Memory**: 512 MB minimum (recommended: 1024 MB)
   - **IAM Role**: Must have DynamoDB permissions (see Step 2)

3. **Set Environment Variables:**
   ```env
   SLACK_BOT_TOKEN=xoxb-your-token
   SLACK_SIGNING_SECRET=your-signing-secret
   AWS_REGION=us-east-1
   DYNAMODB_TASKS_TABLE=slack-tasks
   DYNAMODB_CONFIG_TABLE=slack-channel-config
   DEFAULT_TZ=Asia/Jerusalem
   DEFAULT_POST_HOURS=9,13,17
   ```

4. **Upload the function code:**
   - Upload `function.zip` via AWS Console
   - Or use AWS CLI: `aws lambda update-function-code --function-name your-function-name --zip-file fileb://function.zip`

### Step 4: Set Up API Gateway or Function URL

**Option A: API Gateway (Recommended for production)**
1. Create a new REST API or HTTP API
2. Create a POST endpoint
3. Integrate with your Lambda function
4. Deploy the API
5. Use the API endpoint URL as your Slack app's Request URL

**Option B: Function URL (Simpler)**
1. In Lambda console, enable "Function URL"
2. Set Auth type to "AWS_IAM" or "NONE" (for testing)
3. Copy the Function URL
4. Use this URL as your Slack app's Request URL

### Step 5: Set Up Scheduled Posts (EventBridge)

The bot needs to post checklists at scheduled times. Set up EventBridge:

1. Go to [EventBridge Console](https://console.aws.amazon.com/events/)
2. Create a new rule:
   - **Name**: `slack-tasks-scheduler`
   - **Schedule**: `rate(1 minute)` or `cron(* * * * ? *)`
   - **Target**: Your Lambda function
   - **Target input**: Use "Configure target input" → "Constant (JSON text)" → `{}`
3. Ensure the Lambda function has permission to be invoked by EventBridge

**Note:** The scheduled handler is exported as `lambda.scheduledHandler`. If using a separate Lambda function for scheduling, point it to `lambda.scheduledHandler`.

**Features:**
- ✅ DynamoDB database (serverless, auto-scaling)
- ✅ Lambda function (serverless, pay-per-use)
- ✅ EventBridge for scheduled posts
- ✅ No server management required

---

## Using Serverless Framework

Create `serverless.yml`:

```yaml
service: slack-tasks-bot

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    SLACK_BOT_TOKEN: ${env:SLACK_BOT_TOKEN}
    SLACK_SIGNING_SECRET: ${env:SLACK_SIGNING_SECRET}
    AWS_REGION: us-east-1
    DYNAMODB_TASKS_TABLE: slack-tasks
    DYNAMODB_CONFIG_TABLE: slack-channel-config
    DEFAULT_TZ: ${env:DEFAULT_TZ, 'Asia/Jerusalem'}
    DEFAULT_POST_HOURS: ${env:DEFAULT_POST_HOURS, '9,13,17'}
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - dynamodb:PutItem
            - dynamodb:GetItem
            - dynamodb:UpdateItem
            - dynamodb:DeleteItem
            - dynamodb:Query
            - dynamodb:Scan
          Resource:
            - arn:aws:dynamodb:${self:provider.region}:*:table/slack-tasks
            - arn:aws:dynamodb:${self:provider.region}:*:table/slack-tasks/*
            - arn:aws:dynamodb:${self:provider.region}:*:table/slack-channel-config
            - arn:aws:dynamodb:${self:provider.region}:*:table/slack-channel-config/*

functions:
  bot:
    handler: lambda.handler
    events:
      - http:
          path: slack/events
          method: post
  scheduled:
    handler: lambda.scheduledHandler
    events:
      - schedule: rate(1 minute)
```

Deploy:
```bash
serverless deploy
```

---

## Commands

The bot supports both English and Hebrew commands:

| Command | English | Hebrew |
|---------|---------|--------|
| **Add task** | `task: <description>` | `משימה: <description>` |
| **Show tasks** | `show tasks` | `הדפס משימות` |
| **Set posting hours** | `set hours 9,13,17` | - |
| **Set timezone** | `set tz Asia/Jerusalem` | - |

---

## Environment Variables

### Required
- `SLACK_BOT_TOKEN` - Your Slack bot token (starts with `xoxb-`)
- `SLACK_SIGNING_SECRET` - Your Slack app's signing secret

### Optional
- `PORT` - Server port for local deployment (default: `3000`)
- `AWS_REGION` - AWS region for DynamoDB (default: `us-east-1`)
- `DYNAMODB_TASKS_TABLE` - DynamoDB table name for tasks (default: `slack-tasks`)
- `DYNAMODB_CONFIG_TABLE` - DynamoDB table name for config (default: `slack-channel-config`)
- `DEFAULT_TZ` - Default timezone (default: `Asia/Jerusalem`)
- `DEFAULT_POST_HOURS` - Default posting hours, comma-separated (default: `9,13,17`)

**Note:** Database selection is automatic:
- **Local (Node.js)**: Uses SQLite automatically
- **Lambda**: Uses DynamoDB automatically (when `AWS_LAMBDA_FUNCTION_NAME` is set)

---

## Project Structure

```
.
├── app.js                          # Main application (local/Node.js)
├── lambda.js                       # AWS Lambda handlers
├── .env                            # Environment variables (not in git)
├── db/
│   ├── sqlite.js                   # SQLite database (local only)
│   └── dynamodb.js                 # DynamoDB client configuration
├── scripts/
│   └── create-dynamodb-tables.js   # Script to create DynamoDB tables
├── services/
│   ├── taskService.js              # Task CRUD operations (auto-selects DB)
│   └── configService.js            # Channel configuration (auto-selects DB)
├── handlers/
│   ├── messageHandler.js           # Message event handling
│   └── actionHandler.js            # Button action handling
├── utils/
│   └── checklistBuilder.js         # Slack block building
└── scheduler/
    └── cronScheduler.js            # Cron job scheduler (local only)
```

---

## Troubleshooting

### "Table not found" error (Lambda)
- Ensure DynamoDB tables are created (run `node scripts/create-dynamodb-tables.js`)
- Check table names match environment variables
- Verify AWS credentials and region are correct

### "Access denied" or permission errors (Lambda)
- Check AWS credentials are configured (`aws configure`)
- For Lambda, verify IAM role has DynamoDB permissions
- Ensure the IAM policy includes all required DynamoDB actions

### Lambda timeout errors
- Increase Lambda timeout (recommended: 60 seconds)
- Check CloudWatch logs for specific errors
- Verify DynamoDB tables exist and are accessible

### Scheduled posts not working (Lambda)
- Verify EventBridge rule is created and enabled
- Check Lambda function has permission to be invoked by EventBridge
- Ensure `scheduledHandler` is properly configured
- Check CloudWatch logs for scheduled function executions

### Database selection
- **Local**: SQLite is used automatically (creates `tasks.db` file)
- **Lambda**: DynamoDB is used automatically (when `AWS_LAMBDA_FUNCTION_NAME` is set)
- No manual configuration needed - the code detects the environment automatically

---

## Cost Considerations

For detailed cost analysis, see `DATABASE_COST_ANALYSIS.md`.

**Quick summary:**
- **Local (SQLite)**: Free (local file storage)
- **Lambda + DynamoDB**: ~$3-40/month for small-medium usage (< 50K ops/month)
- DynamoDB is more cost-effective for variable traffic patterns
