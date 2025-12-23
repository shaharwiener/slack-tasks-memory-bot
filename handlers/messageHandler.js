const taskService = require("../services/taskService");
const configService = require("../services/configService");
const { postChecklist } = require("../utils/checklistBuilder");

// Hebrew and English command mappings
const COMMANDS = {
  SHOW_TASKS: ["show tasks", "הדפס משימות"],
  TASK_PREFIX: ["task:", "משימה:"],
};

function isCommand(text, command) {
  const lower = text.toLowerCase();
  return COMMANDS[command].some(cmd => lower === cmd || lower.startsWith(cmd));
}

function extractTaskText(text) {
  for (const prefix of COMMANDS.TASK_PREFIX) {
    if (text.toLowerCase().startsWith(prefix)) {
      return text.slice(prefix.length).trim();
    }
  }
  return null;
}

async function handleMessage({ event, client, context }) {
  if (event.subtype) return;
  if (!event.text) return;

  const workspaceId = context.teamId;
  const channelId = event.channel;
  const text = event.text.trim();
  const lower = text.toLowerCase();

  await configService.ensureChannelConfig(workspaceId, channelId);

  // Show tasks command (English or Hebrew)
  if (isCommand(lower, "SHOW_TASKS")) {
    await postChecklist(client, workspaceId, channelId, taskService);
    return;
  }

  // Set hours command
  if (lower.startsWith("set hours")) {
    const hoursCsv = text.split("set hours")[1]?.trim();
    if (!hoursCsv) {
      await client.chat.postMessage({ channel: channelId, text: "Usage: `set hours 9,13,17`" });
      return;
    }
    await configService.setHours(workspaceId, channelId, hoursCsv);
    await client.chat.postMessage({ channel: channelId, text: `✅ Saved hours: \`${hoursCsv}\`` });
    return;
  }

  // Set timezone command
  if (lower.startsWith("set tz")) {
    const tz = text.split("set tz")[1]?.trim();
    if (!tz) {
      await client.chat.postMessage({ channel: channelId, text: "Usage: `set tz Asia/Jerusalem`" });
      return;
    }
    await configService.setTz(workspaceId, channelId, tz);
    await client.chat.postMessage({ channel: channelId, text: `✅ Saved timezone: \`${tz}\`` });
    return;
  }

  // Add task command (English or Hebrew)
  const taskText = extractTaskText(text);
  if (taskText) {
    await taskService.addTask(workspaceId, channelId, taskText, event.user);
  }
}

module.exports = {
  handleMessage,
};

