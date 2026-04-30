const os = require("os");
const { createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "uptime2",
    aliases: ["system"],
    version: "2.0",
    author: "Ashik + ChatGPT",
    role: 0,
    category: "system",
    countDown: 5
  },

  onStart: async function ({ api, event }) {

    const canvas = createCanvas(900, 520);
    const ctx = canvas.getContext("2d");

    // ===== Purple Background =====
    ctx.fillStyle = "#1b0b2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#2a0f45";
    ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);

    // ===== Title =====
    ctx.font = "bold 42px Arial";
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#ff4fd8";
    ctx.fillStyle = "#ff77e9";
    ctx.fillText("ANNIE BB'Z AI", 60, 85);

    ctx.font = "bold 32px Arial";
    ctx.shadowBlur = 18;
    ctx.shadowColor = "#ff3b3b";
    ctx.fillStyle = "#ff5a5a";
    ctx.fillText("System Monitor", 360, 85);

    ctx.shadowBlur = 0;

    // ===== Data =====
    const uptime = process.uptime();
    const formatTime = s => {
      const d = Math.floor(s / 86400);
      s %= 86400;
      const h = Math.floor(s / 3600);
      s %= 3600;
      const m = Math.floor(s / 60);
      const sec = Math.floor(s % 60);
      return `${d}d ${h}h ${m}m ${sec}s`;
    };

    const cpuModel = os.cpus()[0].model;
    const cores = os.cpus().length;
    const load = os.loadavg()[0];
    const cpuPercent = Math.min((load / cores) * 100, 100).toFixed(1);

    const totalRam = os.totalmem();
    const usedRam = totalRam - os.freemem();
    const ramPercent = ((usedRam / totalRam) * 100).toFixed(1);

    const startY = 150;
    const gap = 42;

    ctx.font = "22px Arial";
    ctx.fillStyle = "#e8d9ff";

    const info = [
      `⏱ Uptime: ${formatTime(uptime)}`,
      `🧠 CPU: ${cpuModel} (${cores} cores)`,
      `📊 Load Avg: ${load.toFixed(2)} (${cpuPercent}%)`,
      `💾 RAM: ${(usedRam / 1024 / 1024).toFixed(0)} MB / ${(totalRam / 1024 / 1024).toFixed(0)} MB`,
      `🖥 Platform: ${os.platform()} (${os.arch()})`,
      `🧩 Node: ${process.version}`,
      `🏷 Host: ${os.hostname()}`
    ];

    info.forEach((t, i) => {
      ctx.fillText(t, 60, startY + i * gap);
    });

    // ===== RAM BAR (Glow) =====
    const barX = 60;
    const barWidth = 780;
    const barHeight = 22;

    ctx.fillStyle = "#31134d";
    ctx.fillRect(barX, 430, barWidth, barHeight);

    ctx.shadowBlur = 20;
    ctx.shadowColor = "#00ffcc";
    ctx.fillStyle = "#00ffd5";
    ctx.fillRect(barX, 430, barWidth * ramPercent / 100, barHeight);

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffffff";
    ctx.font = "18px Arial";
    ctx.fillText(`RAM Usage: ${ramPercent}%`, barX + 10, 447);

    // ===== CPU BAR (Glow) =====
    ctx.fillStyle = "#3b2b00";
    ctx.fillRect(barX, 465, barWidth, barHeight);

    ctx.shadowBlur = 20;
    ctx.shadowColor = "#ffd000";
    ctx.fillStyle = "#ffd000";
    ctx.fillRect(barX, 465, barWidth * cpuPercent / 100, barHeight);

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`CPU Load: ${cpuPercent}%`, barX + 10, 482);

    // ===== Save & Send =====
    const imgPath = path.join(__dirname, "cache", `uptime_${event.senderID}.png`);
    fs.ensureDirSync(path.dirname(imgPath));
    fs.writeFileSync(imgPath, canvas.toBuffer());

    const messageText =
`🖥 ANNIE BB'Z AI - System Monitor

⏱ Uptime: ${formatTime(uptime)}

🧠 CPU:
${cpuModel}
Cores: ${cores}

📊 Load Average:
${load.toFixed(2)} (${cpuPercent}%)

💾 RAM Usage:
${(usedRam / 1024 / 1024).toFixed(0)} MB /
${(totalRam / 1024 / 1024).toFixed(0)} MB
(${ramPercent}%)

🖥 Platform:
${os.platform()} (${os.arch()})

🧩 Node Version:
${process.version}

🏷 Host:
${os.hostname()}`;

api.sendMessage(
  {
    body: messageText,
    attachment: fs.createReadStream(imgPath)
  },
  event.threadID,
  () => fs.unlinkSync(imgPath)
);
  }
};