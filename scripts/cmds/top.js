const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "top",
  version: "2.2.0",
  author: "Ashik + ChatGPT",
  role: 0,
  category: "group",
  guide: "{pn}"
};

const PAGE_LIMIT = 10;

/* 👤 FB PROFILE PICTURE */
async function getProfilePicture(uid) {
  try {
    const url = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
    return await loadImage(url);
  } catch {
    return null;
  }
}

/* 👑 CROWN ICON (DRAW) */
function drawCrown(ctx, x, y) {
  ctx.save();
  ctx.fillStyle = "#ffd700";
  ctx.shadowBlur = 25;
  ctx.shadowColor = "#ffd700";

  ctx.beginPath();
  ctx.moveTo(x - 28, y);
  ctx.lineTo(x - 14, y - 24);
  ctx.lineTo(x, y - 6);
  ctx.lineTo(x + 14, y - 24);
  ctx.lineTo(x + 28, y);
  ctx.closePath();
  ctx.fill();

  ctx.fillRect(x - 30, y, 60, 8);
  ctx.restore();
}

/* 🌌 GALAXY BACKGROUND */
function drawGalaxy(ctx, w, h) {
  ctx.fillStyle = "#070b1a";
  ctx.fillRect(0, 0, w, h);

  const colors = ["#ff4d4d", "#4da6ff", "#00ff88", "#ffffff"];
  for (let i = 0; i < 420; i++) {
    const c = colors[Math.floor(Math.random() * colors.length)];
    ctx.fillStyle = c;
    ctx.shadowBlur = Math.random() * 25 + 10;
    ctx.shadowColor = c;
    ctx.fillRect(
      Math.random() * w,
      Math.random() * h,
      Math.random() * 2 + 1,
      Math.random() * 2 + 1
    );
  }
  ctx.shadowBlur = 0;
}

/* ================= START ================= */
module.exports.onStart = async function ({ api, event, threadsData, usersData }) {
  return sendPage({ api, event, threadsData, usersData, page: 1 });
};

module.exports.onReply = async function ({ api, event, Reply, threadsData, usersData }) {
  if (event.senderID != Reply.author) return;
  const page = parseInt(event.body);
  if (!page || page < 1) return;
  return sendPage({ api, event, threadsData, usersData, page });
};

/* ================= PAGE ================= */
async function sendPage({ api, event, threadsData, usersData, page }) {
  const threadID = event.threadID;
  const threadInfo = await threadsData.get(threadID);
  if (!threadInfo?.members) return;

  let data = [];
  for (const m of threadInfo.members) {
    const uid = Number(m.userID);
    if (!uid) continue;
    const u = await usersData.get(uid);
    data.push({
      uid,
      name: u?.name || "Unknown",
      count: u?.count || u?.exp || 0
    });
  }

  data.sort((a, b) => b.count - a.count);

  const totalPage = Math.ceil(data.length / PAGE_LIMIT);
  if (page > totalPage) return;

  const start = (page - 1) * PAGE_LIMIT;
  const list = data.slice(start, start + PAGE_LIMIT);

  const canvas = createCanvas(900, 1200);
  const ctx = canvas.getContext("2d");

  /* 🌌 BACKGROUND */
  drawGalaxy(ctx, canvas.width, canvas.height);

  /* TITLE */
  ctx.font = "bold 42px Sans";
  ctx.fillStyle = "#00f2ff";
  ctx.textAlign = "center";
  ctx.shadowBlur = 20;
  ctx.shadowColor = "#00f2ff";
  ctx.fillText("GROUP ACTIVITY LEADERBOARD", 450, 60);
  ctx.shadowBlur = 0;

  /* 🥇🥈🥉 TOP 3 */
  const top = data.slice(0, 3);
  const xPos = [450, 250, 650];
  const glow = ["#ffffff", "#ffd700", "#b400ff"];

  for (let i = 0; i < top.length; i++) {
    const x = xPos[i];
    const y = 180;
    const r = 60;
    const avatar = await getProfilePicture(top[i].uid);

    ctx.save();
    ctx.shadowBlur = 35;
    ctx.shadowColor = glow[i];
    ctx.strokeStyle = glow[i];
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(x, y, r + 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    if (avatar) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatar, x - r, y - r, r * 2, r * 2);
      ctx.restore();
    }

    if (i === 0) drawCrown(ctx, x, y - 85);

    ctx.fillStyle = "#fff";
    ctx.font = "bold 22px Sans";
    ctx.fillText(`#${i + 1}`, x, y + 95);
    ctx.font = "18px Sans";
    ctx.fillText(`${top[i].count} messages`, x, y + 145);
  }

  /* 📋 LIST */
  let y = 370;
  for (let i = 0; i < list.length; i++) {
    const rank = start + i + 1;
    const u = list[i];
    const avatar = await getProfilePicture(u.uid);

    ctx.fillStyle = "rgba(20,26,46,0.9)";
    ctx.fillRect(50, y - 35, 800, 65);

    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#00ff88";
    ctx.strokeStyle = "#00ff88";
    ctx.beginPath();
    ctx.arc(90, y, 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    if (avatar) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(90, y, 20, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatar, 70, y - 20, 40, 40);
      ctx.restore();
    }

    ctx.fillStyle = "#ffd700";
    ctx.font = "bold 22px Sans";
    ctx.textAlign = "left";
    ctx.fillText(`#${rank}`, 130, y + 7);

    ctx.fillStyle = "#ffffff";
    ctx.fillText(u.name, 200, y + 7);

    ctx.fillStyle = "#222";
    ctx.fillRect(200, y + 18, 480, 8);

    const barWidth = (u.count / data[0].count) * 480;

// 🌈 premium gradient
const grad = ctx.createLinearGradient(200, 0, 200 + barWidth, 0);
grad.addColorStop(0.0, "#00ff88");   // neon green
grad.addColorStop(0.35, "#a855f7");  // purple
grad.addColorStop(0.65, "#facc15");  // yellow
grad.addColorStop(1.0, "#e5e7eb");   // silver

ctx.fillStyle = grad;
ctx.fillRect(200, y + 18, barWidth, 8);

    ctx.fillStyle = "#00ffaa";
    ctx.textAlign = "right";
    ctx.fillText(u.count, 820, y + 7);

    y += 80;
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#aaa";
  ctx.font = "18px Sans";
  ctx.fillText(`Reply with page number | Page ${page}/${totalPage}`, 450, 1150);

  const file = path.join(__dirname, "cache", `activity_${threadID}.png`);
  fs.ensureDirSync(path.dirname(file));
  fs.writeFileSync(file, canvas.toBuffer());

  api.sendMessage({
    body: "👑 Activity Leaderboard",
    attachment: fs.createReadStream(file)
  }, threadID, (err, info) => {
    if (!err) {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: "top",
        author: event.senderID
      });
    }
  });
}