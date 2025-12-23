#!/usr/bin/env node

/**
 * Script to create DynamoDB tables for the Slack Tasks Bot
 * 
 * Usage:
 *   node scripts/create-dynamodb-tables.js
 * 
 * Environment variables:
 *   AWS_REGION - AWS region (default: us-east-1)
 *   DYNAMODB_TASKS_TABLE - Tasks table name (default: slack-tasks)
 *   DYNAMODB_CONFIG_TABLE - Config table name (default: slack-channel-config)
 */

require("dotenv").config();
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { CreateTableCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const TASKS_TABLE = process.env.DYNAMODB_TASKS_TABLE || "slack-tasks";
const CONFIG_TABLE = process.env.DYNAMODB_CONFIG_TABLE || "slack-channel-config";

async function createTables() {
  console.log("Creating DynamoDB tables...");

  // Create Tasks table
  try {
    console.log(`Creating table: ${TASKS_TABLE}`);
    await client.send(
      new CreateTableCommand({
        TableName: TASKS_TABLE,
        KeySchema: [
          { AttributeName: "pk", KeyType: "HASH" }, // Partition key
          { AttributeName: "sk", KeyType: "RANGE" }, // Sort key
        ],
        AttributeDefinitions: [
          { AttributeName: "pk", AttributeType: "S" },
          { AttributeName: "sk", AttributeType: "S" },
        ],
        BillingMode: "PAY_PER_REQUEST", // On-demand pricing
      })
    );
    console.log(`✅ Table ${TASKS_TABLE} created successfully`);
  } catch (error) {
    if (error.name === "ResourceInUseException") {
      console.log(`⚠️  Table ${TASKS_TABLE} already exists`);
    } else {
      console.error(`❌ Error creating ${TASKS_TABLE}:`, error.message);
      throw error;
    }
  }

  // Create Channel Config table
  try {
    console.log(`Creating table: ${CONFIG_TABLE}`);
    await client.send(
      new CreateTableCommand({
        TableName: CONFIG_TABLE,
        KeySchema: [
          { AttributeName: "pk", KeyType: "HASH" }, // Partition key
          { AttributeName: "sk", KeyType: "RANGE" }, // Sort key
        ],
        AttributeDefinitions: [
          { AttributeName: "pk", AttributeType: "S" },
          { AttributeName: "sk", AttributeType: "S" },
        ],
        BillingMode: "PAY_PER_REQUEST", // On-demand pricing
      })
    );
    console.log(`✅ Table ${CONFIG_TABLE} created successfully`);
  } catch (error) {
    if (error.name === "ResourceInUseException") {
      console.log(`⚠️  Table ${CONFIG_TABLE} already exists`);
    } else {
      console.error(`❌ Error creating ${CONFIG_TABLE}:`, error.message);
      throw error;
    }
  }

  console.log("\n✅ All tables created successfully!");
  console.log("\nTable structure:");
  console.log(`  ${TASKS_TABLE}:`);
  console.log("    - Partition Key (pk): workspace_id#channel_id");
  console.log("    - Sort Key (sk): task_id");
  console.log(`  ${CONFIG_TABLE}:`);
  console.log("    - Partition Key (pk): workspace_id");
  console.log("    - Sort Key (sk): channel_id");
}

// Run the script
createTables()
  .then(() => {
    console.log("\n✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Failed:", error);
    process.exit(1);
  });

