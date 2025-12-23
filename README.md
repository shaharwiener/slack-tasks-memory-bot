# Slack Tasks Memory Bot

A Slack bot that helps teams manage and remember tasks across channels. The bot allows users to add tasks, view task checklists, and automatically posts reminders at configured times. Supports both English and Hebrew commands.

## Features

- ✅ **Task Management**: Add, view, and complete tasks in Slack channels
- 🌍 **Bilingual Support**: Works with both English and Hebrew commands
- ⏰ **Scheduled Reminders**: Automatically posts task checklists at configured hours
- 🗄️ **Flexible Database**: SQLite for local development, DynamoDB for production
- 🚀 **Serverless Ready**: Full AWS Lambda support with Terraform infrastructure
- ⚙️ **Configurable**: Per-channel timezone and posting schedule configuration

## Quick Start

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shaharwiener/slack-tasks-memory-bot.git
   cd slack-tasks-memory-bot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file:
   ```env
   SLACK_BOT_TOKEN=xoxb-your-token
   SLACK_SIGNING_SECRET=your-signing-secret
   PORT=3000
   DEFAULT_TZ=Asia/Jerusalem
   DEFAULT_POST_HOURS=9,13,17
   ```

4. **Run the bot:**
   ```bash
   node app.js
   ```

5. **Configure your Slack app:**
   - Set the Request URL to: `http://your-server:3000/slack/events`
   - Or use a tunneling service like ngrok for local testing

### AWS Lambda Deployment

See the [Deployment Guide](DEPLOYMENT.md) for detailed instructions, or use Terraform:

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your Slack tokens
terraform init
terraform plan
terraform apply
```

## Commands

The bot supports both English and Hebrew commands:

| Action | English | Hebrew |
|--------|---------|--------|
| **Add task** | `task: <description>` | `משימה: <description>` |
| **Show tasks** | `show tasks` | `הדפס משימות` |
| **Set posting hours** | `set hours 9,13,17` | - |
| **Set timezone** | `set tz Asia/Jerusalem` | - |

### Examples

- Add a task: `task: Review pull request #123`
- Add a task (Hebrew): `משימה: לבדוק את הקוד`
- Show all tasks: `show tasks` or `הדפס משימות`
- Configure posting at 9 AM, 1 PM, and 5 PM: `set hours 9,13,17`
- Set timezone: `set tz America/New_York`

## Project Structure

```
.
├── app.js                          # Main Node.js application (local)
├── lambda.js                       # AWS Lambda handlers
├── db/
│   ├── sqlite.js                   # SQLite database (local only)
│   └── dynamodb.js                 # DynamoDB client (Lambda)
├── services/
│   ├── taskService.js              # Task CRUD operations
│   └── configService.js            # Channel configuration
├── handlers/
│   ├── messageHandler.js           # Message event handling
│   └── actionHandler.js            # Button action handling
├── utils/
│   └── checklistBuilder.js         # Slack block building
├── scheduler/
│   └── cronScheduler.js            # Cron job scheduler (local)
├── scripts/
│   └── create-dynamodb-tables.js   # DynamoDB table creation script
├── terraform/                       # Infrastructure as Code
│   ├── main.tf                     # Provider configuration
│   ├── variables.tf                # Input variables
│   ├── dynamodb.tf                 # DynamoDB tables
│   ├── lambda.tf                   # Lambda functions
│   ├── iam.tf                      # IAM roles and policies
│   ├── api_gateway.tf              # API Gateway (optional)
│   ├── function_url.tf             # Function URL (optional)
│   ├── eventbridge.tf               # EventBridge scheduling
│   └── outputs.tf                  # Output values
├── DEPLOYMENT.md                   # Detailed deployment guide
├── DATABASE_COST_ANALYSIS.md       # Database cost comparison
└── README.md                       # This file
```

## Database

The bot automatically selects the appropriate database:

- **Local Development**: Uses SQLite (creates `tasks.db` automatically)
- **AWS Lambda**: Uses DynamoDB (automatically detected)

No configuration needed - the code detects the environment and uses the correct database.

## Configuration

### Environment Variables

**Required:**
- `SLACK_BOT_TOKEN` - Your Slack bot token (starts with `xoxb-`)
- `SLACK_SIGNING_SECRET` - Your Slack app's signing secret

**Optional:**
- `PORT` - Server port for local deployment (default: `3000`)
- `AWS_REGION` - AWS region for DynamoDB (default: `us-east-1`)
- `DYNAMODB_TASKS_TABLE` - DynamoDB table name (default: `slack-tasks`)
- `DYNAMODB_CONFIG_TABLE` - DynamoDB config table (default: `slack-channel-config`)
- `DEFAULT_TZ` - Default timezone (default: `Asia/Jerusalem`)
- `DEFAULT_POST_HOURS` - Default posting hours (default: `9,13,17`)

## Deployment Options

### 1. Local Development (Node.js + SQLite)

Perfect for development and testing:
- No AWS setup required
- SQLite database (local file)
- Cron scheduler runs automatically
- See [Deployment Guide - Local](DEPLOYMENT.md#local-deployment-sqlite--nodejs)

### 2. AWS Lambda (DynamoDB + Lambda)

Production-ready serverless deployment:
- DynamoDB for data storage
- Lambda for compute
- EventBridge for scheduling
- See [Deployment Guide - AWS Lambda](DEPLOYMENT.md#aws-lambda-deployment-dynamodb--lambda)

### 3. Terraform (Infrastructure as Code)

Automated infrastructure provisioning:
- One command to deploy everything
- See [terraform/README.md](terraform/README.md)

## How It Works

1. **Adding Tasks**: Users type `task: <description>` in any channel
2. **Viewing Tasks**: Users type `show tasks` to see all open tasks
3. **Completing Tasks**: Click the "Done" button on any task
4. **Scheduled Posts**: Bot automatically posts checklists at configured hours
5. **Configuration**: Each channel can have its own timezone and posting schedule

## Cost Analysis

For detailed cost information, see [DATABASE_COST_ANALYSIS.md](DATABASE_COST_ANALYSIS.md).

**Quick Summary:**
- **Local (SQLite)**: Free
- **Lambda + DynamoDB**: ~$3-40/month for small-medium usage

## Development

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- AWS account (for Lambda deployment)
- Slack app with bot token and signing secret

### Installing Dependencies

```bash
npm install
```

### Running Tests

Currently, the project doesn't include tests. Contributions welcome!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Support

For issues and questions:
- Open an issue on [GitHub](https://github.com/shaharwiener/slack-tasks-memory-bot/issues)
- Check the [Deployment Guide](DEPLOYMENT.md) for deployment help
- Review [DATABASE_COST_ANALYSIS.md](DATABASE_COST_ANALYSIS.md) for cost information

## Acknowledgments

Built with:
- [Slack Bolt Framework](https://github.com/slackapi/bolt-js)
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- [AWS SDK](https://aws.amazon.com/sdk-for-javascript/)
- [Terraform](https://www.terraform.io/)

