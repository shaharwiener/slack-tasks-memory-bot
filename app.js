require("dotenv").config();
const { App } = require("@slack/bolt");
const messageHandler = require("./handlers/messageHandler");
const actionHandler = require("./handlers/actionHandler");
const scheduler = require("./scheduler/cronScheduler");

// Initialize SQLite database for local development (imported for side effects)
require("./db/sqlite");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  port: Number(process.env.PORT || 3000),
});

// Register message event handler
app.event("message", messageHandler.handleMessage);

// Register action handlers
app.action("task_done", actionHandler.handleTaskDone);

// Start cron scheduler (only for non-Lambda deployments)
if (process.env.AWS_LAMBDA_FUNCTION_NAME === undefined) {
  scheduler.startScheduler(app);
}

// Start the app (only for non-Lambda deployments)
if (process.env.AWS_LAMBDA_FUNCTION_NAME === undefined) {
  (async () => {
    await app.start();
    console.log(`⚡️ Bot running on port ${process.env.PORT || 3000}`);
  })();
}

// Export app for Lambda
module.exports = app;
