// Task service - automatically uses SQLite (local) or DynamoDB (Lambda)
const IS_LAMBDA = process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;

if (IS_LAMBDA) {
  // DynamoDB implementation for Lambda
  const { docClient, TASKS_TABLE } = require("../db/dynamodb");
  const { PutCommand, QueryCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

  function generateTaskId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async function addTask(workspaceId, channelId, text, user) {
    const taskId = generateTaskId();
    const partitionKey = `${workspaceId}#${channelId}`;
    
    await docClient.send(
      new PutCommand({
        TableName: TASKS_TABLE,
        Item: {
          pk: partitionKey,
          sk: taskId,
          id: taskId,
          workspace_id: workspaceId,
          channel_id: channelId,
          text: text,
          created_by: user,
          created_at: Date.now(),
        },
      })
    );
    
    return taskId;
  }

  async function listTasks(workspaceId, channelId) {
    const partitionKey = `${workspaceId}#${channelId}`;
    
    const result = await docClient.send(
      new QueryCommand({
        TableName: TASKS_TABLE,
        KeyConditionExpression: "pk = :pk",
        ExpressionAttributeValues: {
          ":pk": partitionKey,
        },
        ScanIndexForward: true,
      })
    );
    
    return (result.Items || []).map((item) => ({
      id: item.id,
      text: item.text,
    }));
  }

  async function deleteTask(workspaceId, channelId, taskId) {
    const partitionKey = `${workspaceId}#${channelId}`;
    
    await docClient.send(
      new DeleteCommand({
        TableName: TASKS_TABLE,
        Key: {
          pk: partitionKey,
          sk: taskId,
        },
      })
    );
  }

  module.exports = {
    addTask,
    listTasks,
    deleteTask,
  };
} else {
  // SQLite implementation for local development
  const db = require("../db/sqlite");

  async function addTask(workspaceId, channelId, text, user) {
    db.prepare(
      "INSERT INTO tasks (workspace_id, channel_id, text, created_by, created_at) VALUES (?, ?, ?, ?, ?)"
    ).run(workspaceId, channelId, text, user, Date.now());
  }

  async function listTasks(workspaceId, channelId) {
    return db.prepare(
      "SELECT id, text FROM tasks WHERE workspace_id=? AND channel_id=? ORDER BY id ASC"
    ).all(workspaceId, channelId);
  }

  async function deleteTask(workspaceId, channelId, taskId) {
    db.prepare(
      "DELETE FROM tasks WHERE workspace_id=? AND channel_id=? AND id=?"
    ).run(workspaceId, channelId, taskId);
  }

  module.exports = {
    addTask,
    listTasks,
    deleteTask,
  };
}
