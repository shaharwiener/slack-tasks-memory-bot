require("dotenv").config();
const { App, AwsLambdaReceiver } = require("@slack/bolt");
const messageHandler = require("./handlers/messageHandler");
const actionHandler = require("./handlers/actionHandler");

// DynamoDB is automatically used in Lambda (no initialization needed)
// Services will detect AWS_LAMBDA_FUNCTION_NAME and use DynamoDB

// Create AWS Lambda receiver
const receiver = new AwsLambdaReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Create Slack app instance for Lambda
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: receiver,
});

// Register message event handler
app.event("message", messageHandler.handleMessage);

// Register action handlers
app.action("task_done", actionHandler.handleTaskDone);

// Handle Lambda function
module.exports.handler = async (event, context, callback) => {
  const handler = await receiver.start();
  return handler(event, context, callback);
};

// For scheduled posts (EventBridge trigger)
// This should be set up as a separate Lambda function triggered by EventBridge
module.exports.scheduledHandler = async (event) => {
  const configService = require("./services/configService");
  const { postChecklist } = require("./utils/checklistBuilder");
  const taskService = require("./services/taskService");
  const { WebClient } = require("@slack/web-api");

  const client = new WebClient(process.env.SLACK_BOT_TOKEN);
  const configs = await configService.getAllChannelConfigs();
  const now = new Date();

  for (const cfg of configs) {
    const tz = cfg.timezone || "Asia/Jerusalem";
    const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", hour12: false }).format(now));
    const minute = Number(new Intl.DateTimeFormat("en-US", { timeZone: tz, minute: "numeric" }).format(now));
    if (minute !== 0) continue;

    const hours = String(cfg.post_hours || "")
      .split(",")
      .map(s => Number(s.trim()))
      .filter(n => !Number.isNaN(n));

    if (!hours.includes(hour)) continue;

    try {
      await postChecklist(client, cfg.workspace_id, cfg.channel_id, taskService);
    } catch (e) {
      console.error("Scheduled post failed:", cfg.channel_id, e);
    }
  }

  return { statusCode: 200, body: JSON.stringify({ message: "Scheduled posts processed" }) };
};

