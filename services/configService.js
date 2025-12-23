// Config service - automatically uses SQLite (local) or DynamoDB (Lambda)
const IS_LAMBDA = process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;

if (IS_LAMBDA) {
  // DynamoDB implementation for Lambda
  const { docClient, CONFIG_TABLE } = require("../db/dynamodb");
  const { GetCommand, PutCommand, UpdateCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");

  async function ensureChannelConfig(workspaceId, channelId) {
    const result = await docClient.send(
      new GetCommand({
        TableName: CONFIG_TABLE,
        Key: {
          pk: workspaceId,
          sk: channelId,
        },
      })
    );

    if (!result.Item) {
      await docClient.send(
        new PutCommand({
          TableName: CONFIG_TABLE,
          Item: {
            pk: workspaceId,
            sk: channelId,
            workspace_id: workspaceId,
            channel_id: channelId,
            post_hours: process.env.DEFAULT_POST_HOURS || "9,13,17",
            timezone: process.env.DEFAULT_TZ || "Asia/Jerusalem",
          },
        })
      );
    }
  }

  async function setHours(workspaceId, channelId, hoursCsv) {
    await docClient.send(
      new UpdateCommand({
        TableName: CONFIG_TABLE,
        Key: {
          pk: workspaceId,
          sk: channelId,
        },
        UpdateExpression: "SET post_hours = :hours",
        ExpressionAttributeValues: {
          ":hours": hoursCsv,
        },
      })
    );
  }

  async function setTz(workspaceId, channelId, tz) {
    await docClient.send(
      new UpdateCommand({
        TableName: CONFIG_TABLE,
        Key: {
          pk: workspaceId,
          sk: channelId,
        },
        UpdateExpression: "SET timezone = :tz",
        ExpressionAttributeValues: {
          ":tz": tz,
        },
      })
    );
  }

  async function getAllChannelConfigs() {
    const result = await docClient.send(
      new ScanCommand({
        TableName: CONFIG_TABLE,
      })
    );

    return (result.Items || []).map((item) => ({
      workspace_id: item.workspace_id,
      channel_id: item.channel_id,
      post_hours: item.post_hours,
      timezone: item.timezone,
    }));
  }

  module.exports = {
    ensureChannelConfig,
    setHours,
    setTz,
    getAllChannelConfigs,
  };
} else {
  // SQLite implementation for local development
  const db = require("../db/sqlite");

  async function ensureChannelConfig(workspaceId, channelId) {
    const row = db.prepare(
      "SELECT 1 FROM channel_config WHERE workspace_id=? AND channel_id=?"
    ).get(workspaceId, channelId);

    if (!row) {
      db.prepare(
        "INSERT INTO channel_config (workspace_id, channel_id, post_hours, timezone) VALUES (?, ?, ?, ?)"
      ).run(
        workspaceId,
        channelId,
        process.env.DEFAULT_POST_HOURS || "9,13,17",
        process.env.DEFAULT_TZ || "Asia/Jerusalem"
      );
    }
  }

  async function setHours(workspaceId, channelId, hoursCsv) {
    db.prepare(
      "UPDATE channel_config SET post_hours=? WHERE workspace_id=? AND channel_id=?"
    ).run(hoursCsv, workspaceId, channelId);
  }

  async function setTz(workspaceId, channelId, tz) {
    db.prepare(
      "UPDATE channel_config SET timezone=? WHERE workspace_id=? AND channel_id=?"
    ).run(tz, workspaceId, channelId);
  }

  async function getAllChannelConfigs() {
    return db.prepare(
      "SELECT workspace_id, channel_id, post_hours, timezone FROM channel_config"
    ).all();
  }

  module.exports = {
    ensureChannelConfig,
    setHours,
    setTz,
    getAllChannelConfigs,
  };
}
