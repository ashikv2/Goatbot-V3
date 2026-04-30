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
    name: "uidcard",
    aliases: ["uid2"],
    version: "1.1",
    author: "ChatGPT",
    role: 0,
    category: "profile"
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      const uid = Object.keys(event.mentions)[0] || event.senderID;
      const user = await usersData.get(uid);
      const avatar = await getProfilePicture(uid);

      const W = 900;
      const H = 420;
      const canvas = createCanvas(W, H);
      const ctx = canvas.getContext("2d");

      // ===== Background =====
      const gradient = ctx.createLinearGradient(0, 0, W, H);
      gradient.addColorStop(0, "#0b132b");
      gradient.addColorStop(1, "#020617");
      ctx.fillStyle = gradient;
      roundRect(ctx, 0, 0, W, H, 30);
      ctx.fill();

      // ===== Avatar Glow Ring =====
      if (avatar) {
        ctx.shadowColor = "#3b82f6";
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.arc(130, H / 2 - 10, 75 + 6, 0, Math.PI * 2);
        ctx.strokeStyle = "#60a5fa";
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // ===== Avatar =====
        ctx.save();
        ctx.beginPath();
        ctx.arc(130, H / 2 - 10, 75, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatar, 55, H / 2 - 85, 150, 150);
        ctx.restore();
      }

      // ===== Username =====
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 36px Sans-serif";
      ctx.fillText(user.name || "UNKNOWN", 250, 150);

      // ===== Subtitle =====
      ctx.fillStyle = "#ef4444";
      ctx.font = "bold 22px Sans-serif";
      ctx.fillText("Sir Here's your UID", 250, 190);

      // ===== UID =====
      ctx.fillStyle = "#e5e7eb";
      ctx.font = "bold 32px Sans-serif";
      ctx.fillText(`UID: ${uid}`, 250, 250);

      // ===== Footer =====
      ctx.fillStyle = "#9ca3af";
      ctx.font = "18px Sans-serif";
      ctx.fillText("A premium Canvas UID Card | GoatBot v2", 250, 290);

      const imgPath = path.join(__dirname, `uid_card_${uid}.png`);
      fs.writeFileSync(imgPath, canvas.toBuffer());

      return api.sendMessage(
        {
          body: "✨ Your UID Card",
          attachment: fs.createReadStream(imgPath)
        },
        event.threadID,
        () => fs.unlinkSync(imgPath),
        event.messageID
      );

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ UID Card generate failed!", event.threadID);
    }
  }
};