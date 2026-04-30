const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

/* ================= PROFILE IMAGE SYSTEM ================= */
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

/* 💰 Balance formatter (with fraction) */
function formatBalance(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(2).replace(/\.00$/, "") + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(2).replace(/\.00$/, "") + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2).replace(/\.00$/, "") + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2).replace(/\.00$/, "") + "K";
  return String(num);
}

/* ================= COMMAND ================= */
module.exports = {
  config: {
    name: "spy2",
    aliases: ["cyberspy"],
    version: "3.0",
    author: "ChatGPT",
    role: 0,
    countDown: 5,
    category: "info"
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      const uid = Object.keys(event.mentions)[0] || event.senderID;
      const user = await usersData.get(uid);

      const name = user.name || "UNKNOWN";
      const gender = user.gender === 2 ? "FEMALE" : "MALE";
      const money = formatBalance(user.money || 0);
      const exp = formatBalance(user.exp || 0);

      const avatar = await getProfilePicture(uid);

      const W = 1050;
      const H = 620;
      const canvas = createCanvas(W, H);
      const ctx = canvas.getContext("2d");

      /* 🌌 Background */
      ctx.fillStyle = "#070b16";
      ctx.fillRect(0, 0, W, H);

      /* 🟣 Rounded Cyber Border */
      ctx.lineWidth = 6;
      ctx.shadowBlur = 30;
      ctx.shadowColor = "#8b5cf6";
      ctx.strokeStyle = "#22d3ee";
      roundRect(ctx, 20, 20, W - 40, H - 40, 32);
      ctx.stroke();
      ctx.shadowBlur = 0;

      /* 🧑 HEXAGON PROFILE */
      const cx = 180, cy = 190, r = 95;
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.clip();
      avatar && ctx.drawImage(avatar, cx - r, cy - r, r * 2, r * 2);
      ctx.restore();

      ctx.strokeStyle = "#ff00cc";
      ctx.lineWidth = 4;
      ctx.stroke();

      /* 👤 NAME & ID */
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 42px Arial";
      ctx.fillText(name.toUpperCase(), 330, 120);

      ctx.fillStyle = "#22d3ee";
      ctx.font = "26px Arial";
      ctx.fillText(`@${name.toLowerCase().replace(/ /g, ".")}`, 330, 160);

      ctx.fillStyle = "#9ca3af";
      ctx.font = "22px monospace";
      ctx.fillText(`TARGET ID :: ${uid}`, 330, 200);

      /* 📦 INFO BOX */
      function infoBox(title, value, x, y, color) {
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        roundRect(ctx, x, y, 300, 95, 18);
        ctx.fill();

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = "#9ca3af";
        ctx.font = "18px Arial";
        ctx.fillText(title, x + 18, y + 30);

        ctx.fillStyle = color;
        ctx.font = "bold 30px Arial";
        ctx.fillText(value, x + 18, y + 68);
      }

      /* 📊 BOX GRID (PERFECT ALIGN) */
      infoBox("GENDER TYPE", gender, 80, 330, "#ec4899");
      infoBox("BIRTHDAY STATUS", "INACTIVE", 375, 330, "#22d3ee");
      infoBox("CREDITS (BAL)", money, 670, 330, "#a855f7");

      infoBox("EXP LEVEL", exp, 80, 450, "#00ffcc");
      infoBox("WEALTH RANK", "#14", 375, 450, "#facc15");
      infoBox("ACTIVITY RANK", "#23", 670, 450, "#fb923c");

      /* 🔻 Footer */
      ctx.fillStyle = "#6b7280";
      ctx.font = "18px monospace";
      ctx.fillText(
        "SYSTEM::CYBER_SPY // v7.0 EXEC",
        W - 420,
        H - 30
      );

      const filePath = path.join(__dirname, "cache", `spy_${uid}.png`);
      fs.writeFileSync(filePath, canvas.toBuffer());

      api.sendMessage(
        {
          body: "🕵️‍♂️ SPY PROFILE",
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => fs.unlinkSync(filePath)
      );

    } catch (err) {
      console.log(err);
      api.sendMessage("❌ Spy card generate failed", event.threadID);
    }
  }
};