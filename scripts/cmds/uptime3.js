const { createCanvas, loadImage } = require("canvas");
const GIFEncoder = require("gif-encoder-2");
const os = require("os");
const si = require("systeminformation");
const fs = require("fs");
const path = require("path");

/* ================= PROFILE ================= */
async function getProfilePicture(uid) {
  try {
    const url = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
    return await loadImage(url);
  } catch {
    return null;
  }
}

/* ================= UTILS ================= */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* 🌈 Rainbow rotating border */
function drawRainbowCircle(ctx, cx, cy, r, frame) {
  const colors = ["#ff004c","#ffae00","#ffff00","#00ffae","#00c3ff","#4b00ff","#b300ff"];
  const step = (Math.PI * 2) / colors.length;
  const offset = frame * 0.07;

  ctx.lineWidth = 6;
  for (let i = 0; i < colors.length; i++) {
    ctx.beginPath();
    ctx.strokeStyle = colors[i];
    ctx.shadowBlur = 30;
    ctx.shadowColor = colors[i];
    ctx.arc(cx, cy, r, i * step + offset, (i + 1) * step + offset);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
}

/* ✨ Wrapped text helper (CPU multi-line safe) */
function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, x, y);
      line = words[i] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

/* ================= COMMAND ================= */
module.exports = {
  config: {
    name: "uptime3",
    version: "6.2",
    author: "ChatGPT",
    role: 0,
    category: "system",
    countDown: 5
  },

  onStart: async function ({ api, event, usersData }) {

    const W = 950;
    const H = 560;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    const encoder = new GIFEncoder(W, H);
    const gifPath = path.join(__dirname, `uptime_${event.senderID}.gif`);
    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(180);
    encoder.setQuality(10);

    const user = await usersData.get(event.senderID);
    const avatar = await getProfilePicture(event.senderID);

    const totalMem = os.totalmem() / 1024 / 1024;
    const uptime = process.uptime();
    const d = Math.floor(uptime / 86400);
    const h = Math.floor((uptime % 86400) / 3600);
    const m = Math.floor((uptime % 3600) / 60);

    const rainbow = ["#ff004c","#ffae00","#00ffae","#00c3ff","#b300ff"];

    for (let f = 0; f < 20; f++) {
      const mem = await si.mem();
      const usedMB = mem.used / 1024 / 1024;

      /* Background */
      ctx.fillStyle = "#070b16";
      ctx.fillRect(0, 0, W, H);

      /* Border */
      ctx.lineWidth = 6;
      ctx.shadowBlur = 30;
      ctx.shadowColor = "#ffe600";
      ctx.strokeStyle = "#ff00cc";
      roundRect(ctx, 15, 15, W - 30, H - 30, 28);
      ctx.stroke();
      ctx.shadowBlur = 0;

      /* SYSTEM STATUS */
      ctx.font = "bold 44px Arial";
      ctx.shadowBlur = 35;
      ctx.shadowColor = rainbow[f % rainbow.length];
      ctx.fillStyle = rainbow[f % rainbow.length];
      ctx.fillText("⚡ SYSTEM STATUS", 40, 75);
      ctx.shadowBlur = 0;

      /* Loading bar */
      ctx.fillStyle = "#221900";
      ctx.fillRect(40, 105, 560, 24);
      ctx.shadowBlur = 25;
      ctx.shadowColor = "#ffe600";
      ctx.fillStyle = "#ffe600";
      ctx.fillRect(40, 105, 560, 24);
      ctx.shadowBlur = 0;

      /* MAIN INFO BOX */
      roundRect(ctx, 40, 155, 560, 300, 20);
      ctx.strokeStyle = "#00ffe1";
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#00ffe1";
      ctx.stroke();
      ctx.shadowBlur = 0;

      /* TEXT INSIDE BOX */
      ctx.font = "24px Arial";
      ctx.fillStyle = "#ffffff";

      let y = 205;
      ctx.fillText(`Uptime: ${d}d ${h}h ${m}m`, 60, y); y += 38;
      ctx.fillText(`OS: ${os.platform()} x64`, 60, y); y += 38;
      ctx.fillText(`Node: ${process.version}`, 60, y); y += 38;

      // CPU wrapped text (multi-line safe)
      drawWrappedText(
        ctx,
        `CPU: ${os.cpus()[0].model}`,
        60,
        y,
        500,    // box width safe
        28      // line height
      );
      y += 56;

      // RAM inside box
      ctx.fillText(
        `RAM: ${usedMB.toFixed(1)} / ${totalMem.toFixed(0)} MB`,
        60,
        y
      );

      /* PROFILE */
      const cx = 740, cy = 170, r = 64;
      drawRainbowCircle(ctx, cx, cy, r, f);

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r - 8, 0, Math.PI * 2);
      ctx.clip();
      avatar && ctx.drawImage(avatar, cx - (r - 8), cy - (r - 8), (r - 8) * 2, (r - 8) * 2);
      ctx.restore();

      /* USER NAME + UID */
      ctx.font = "bold 28px Arial";
      ctx.shadowBlur = 25;
      ctx.shadowColor = f % 2 ? "#ff0000" : "#ffee00";
      ctx.fillStyle = f % 2 ? "#ffee00" : "#ff0000";
      ctx.fillText(user.name, 650, 290);
      ctx.shadowBlur = 0;

      ctx.font = "18px monospace";
      ctx.fillStyle = "#aaaaaa";
      ctx.fillText(`UID: ${event.senderID}`, 650, 320);

      encoder.addFrame(ctx);
    }

    encoder.finish();
    fs.writeFileSync(gifPath, encoder.out.getData());

    return api.sendMessage(
      {
        body: "🖥️_𝙾𝚆𝙽𝙴𝚁🏮𝙰𝚂𝙷𝙸𝙺]",
        attachment: fs.createReadStream(gifPath)
      },
      event.threadID,
      () => fs.unlinkSync(gifPath)
    );
  }
};