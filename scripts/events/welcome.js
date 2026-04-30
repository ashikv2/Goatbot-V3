const { createCanvas, loadImage, registerFont } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

/* 🔤 Font preload */
(async () => {
  try {
    const fontPath = path.join(__dirname, "cache", "tt-modernoir-trial.bold.ttf");
    if (!fs.existsSync(fontPath)) {
      const fontUrl =
        "https://github.com/MR-MAHABUB-004/MAHABUB-BOT-STORAGE/raw/main/fronts/tt-modernoir-trial.bold.ttf";
      const { data } = await axios.get(fontUrl, { responseType: "arraybuffer" });
      await fs.outputFile(fontPath, data);
    }
    registerFont(fontPath, { family: "ModernoirBold" });
  } catch (e) {
    console.log("Font load failed");
  }
})();

/* 🌈 Neon Gradient */
function neonGradient(ctx, x, y, s) {
  const g = ctx.createLinearGradient(x, y, x + s, y + s);
  ["#ff0000", "#ff7f00", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#8b00ff"]
    .forEach((c, i) => g.addColorStop(i / 6, c));
  return g;
}

/* 👤 FIXED PROFILE PICTURE */
async function getProfilePicture(uid) {
  try {
    const url = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
    return await loadImage(url); // redirect-safe
  } catch {
    return null;
  }
}

/* 👤 Default Avatar */
function drawDefaultAvatar(ctx, x, y, size) {
  ctx.fillStyle = "#22c55e";
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();
}

module.exports = {
  config: {
    name: "welcome",
    version: "5.0",
    author: "ASHIK × HERO",
    category: "events"
  },

  onStart: async ({ threadsData, message, event, api }) => {
    try {
      if (event.logMessageType !== "log:subscribe") return;

      const threadID = event.threadID;
      const added = event.logMessageData.addedParticipants || [];
      const botID = api.getCurrentUserID();

      /* 🤖 Bot added */
      if (added.some(u => u.userFbId === botID)) {
        await api.changeNickname("🤖 Welcome Bot", threadID, botID);
        return api.sendMessage("🤖 Bot connected successfully!", threadID);
      }

      /* 👤 User */
      const user = added[0];
      const userID = user.userFbId;
      const userName = user.fullName;

      const threadData = await threadsData.get(threadID);
      const threadName = threadData.threadName || "Group Chat";
      const memberCount = (await api.getThreadInfo(threadID)).participantIDs.length;

      /* 🕒 Time (BD) */
      const now = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Dhaka",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });

      /* 🎨 Canvas */
      const canvas = createCanvas(1000, 500);
      const ctx = canvas.getContext("2d");

      const bg = await loadImage("https://files.catbox.moe/zhso03.jpg");
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      /* 👤 Avatar */
      const avatar = await getProfilePicture(userID);
      const size = 180;
      const ax = 500 - size / 2;
      const ay = 40;

      ctx.save();
      ctx.beginPath();
      ctx.arc(500, ay + size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();
      avatar
        ? ctx.drawImage(avatar, ax, ay, size, size)
        : drawDefaultAvatar(ctx, ax, ay, size);
      ctx.restore();

      /* 🔵 Avatar Border */
      ctx.lineWidth = 6;
      ctx.strokeStyle = neonGradient(ctx, ax, ay, size);
      ctx.beginPath();
      ctx.arc(500, ay + size / 2, size / 2, 0, Math.PI * 2);
      ctx.stroke();

      /* ✨ Text */
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0,0,0,0.7)";
      ctx.shadowBlur = 6;

      ctx.font = "bold 40px ModernoirBold";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(userName, 500, 270);

      ctx.font = "bold 28px ModernoirBold";
      ctx.fillStyle = "#ffea00";
      ctx.fillText(`WELCOME TO ${threadName}`, 500, 315);

      ctx.font = "bold 24px ModernoirBold";
      ctx.fillStyle = "#00ffcc";
      ctx.fillText(`You're the ${memberCount}th member`, 500, 355);

      /* 📅 Date box on background */
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(20, 420, 420, 55);

      ctx.font = "bold 22px ModernoirBold";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      ctx.fillText(`📅 ${now}  |  🇧🇩 GMT+6`, 35, 455);

      /* 💾 Save */
      const imgPath = path.join(__dirname, "cache", `welcome_${userID}.png`);
      await fs.ensureDir(path.dirname(imgPath));
      await fs.writeFile(imgPath, canvas.toBuffer());

      /* 📨 Message */
      await message.send({
        body: `✨ Assalamu Alaikum______💥 ${userName}!\nWellcome to🧨_________-_-_-_-_-_-_-_____________ ${threadName} 🎇 ━━━━━━━━━━━━━━━━━━━━━━
       📅 ${time}
       🌍 GMT +06:00 (Bangladesh)
       ━━━━━━━━━━━━━━━━━━━━━━`,
        attachment: fs.createReadStream(imgPath)
      });

      setTimeout(() => fs.unlink(imgPath).catch(() => {}), 5000);

    } catch (e) {
      console.error("Welcome error:", e);
    }
  }
};
