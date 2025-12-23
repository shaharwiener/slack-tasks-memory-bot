const taskService = require("../services/taskService");
const { buildChecklistBlocks } = require("../utils/checklistBuilder");

async function handleTaskDone({ body, ack, client, context }) {
  await ack();
  const workspaceId = context.teamId;
  const channelId = body.channel?.id;
  const taskId = body.actions?.[0]?.value; // Keep as string for DynamoDB
  if (!workspaceId || !channelId || !taskId) return;

  await taskService.deleteTask(workspaceId, channelId, taskId);

  const tasks = await taskService.listTasks(workspaceId, channelId);
  await client.chat.update({
    channel: channelId,
    ts: body.message.ts,
    text: "Task checklist (updated)",
    blocks: buildChecklistBlocks(tasks),
  });
}

module.exports = {
  handleTaskDone,
};

