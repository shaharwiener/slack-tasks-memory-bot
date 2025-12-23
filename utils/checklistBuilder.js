function buildChecklistBlocks(tasks) {
  const blocks = [
    { type: "header", text: { type: "plain_text", text: "✅ Task checklist" } },
  ];

  if (tasks.length === 0) {
    blocks.push({ type: "section", text: { type: "mrkdwn", text: "_No open tasks._" } });
    return blocks;
  }

  const maxTasks = Math.min(tasks.length, 40);
  for (const t of tasks.slice(0, maxTasks)) {
    // Use LRM (Left-to-Right Mark) to ensure task number stays on the left for Hebrew text
    const lrm = '\u200E'; // Left-to-Right Mark
    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: `${lrm}*#${t.id}* — ${t.text}` },
      accessory: {
        type: "button",
        text: { type: "plain_text", text: "Done" },
        style: "primary",
        action_id: "task_done",
        value: String(t.id),
      },
    });
  }
  return blocks;
}

async function postChecklist(client, workspaceId, channelId, taskService) {
  const tasks = await taskService.listTasks(workspaceId, channelId);
  await client.chat.postMessage({
    channel: channelId,
    text: "Task checklist",
    blocks: buildChecklistBlocks(tasks),
  });
}

module.exports = {
  buildChecklistBlocks,
  postChecklist,
};

