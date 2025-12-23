const cron = require("node-cron");
const configService = require("../services/configService");
const { postChecklist } = require("../utils/checklistBuilder");
const taskService = require("../services/taskService");

function startScheduler(app) {
  cron.schedule("* * * * *", async () => {
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
        await postChecklist(app.client, cfg.workspace_id, cfg.channel_id, taskService);
      } catch (e) {
        console.error("Scheduled post failed:", cfg.channel_id, e);
      }
    }
  });
}

module.exports = {
  startScheduler,
};

