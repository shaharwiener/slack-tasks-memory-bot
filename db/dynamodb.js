const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const docClient = DynamoDBDocumentClient.from(client);

// Table names (can be overridden via environment variables)
const TASKS_TABLE = process.env.DYNAMODB_TASKS_TABLE || "slack-tasks";
const CONFIG_TABLE = process.env.DYNAMODB_CONFIG_TABLE || "slack-channel-config";

module.exports = {
  docClient,
  TASKS_TABLE,
  CONFIG_TABLE,
};

