// SQLite database for local development only
// DynamoDB is used automatically in Lambda (AWS_LAMBDA_FUNCTION_NAME is set)

const Database = require("better-sqlite3");
const path = require("path");

// Use current directory for local development
const dbPath = process.env.DB_PATH || "tasks.db";

const db = new Database(dbPath);

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workspace_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    text TEXT NOT NULL,
    created_by TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS channel_config (
    workspace_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    post_hours TEXT NOT NULL,
    timezone TEXT NOT NULL,
    PRIMARY KEY (workspace_id, channel_id)
  );
`);

module.exports = db;
