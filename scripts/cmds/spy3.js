const { createCanvas, loadImage } = require("canvas");
const GIFEncoder = require("gif-encoder-2");
const fs = require("fs-extra");
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
    name: "spy3",
    version: "3.2",
    author: "ChatGPT",
    role: 0,
    category: "info"
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      const uid = Object.keys(event.mentions)[0] || event.senderID;
      const user = await usersData.get(uid);
      const avatar = await getProfilePicture(uid);

      const W = 1050;
      const H = 620;
      const canvas = createCanvas(W, H);
      const ctx = canvas.getContext("2d");

      const cacheDir = path.join(__dirname, "cache");
      fs.ensureDirSync(cacheDir);
      const gifPath = path.join(cacheDir, `spy_${uid}.gif`);

      const encoder = new GIFEncoder(W, H);
      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(90);
      encoder.setQuality(10);
      encoder.createReadStream().pipe(fs.createWriteStream(gifPath));

      const stars = Array.from({ length: 35 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 2 + 1,
        c: Math.random() > 0.5 ? "red" : "lime"
      }));

      for (let f = 0; f < 26; f++) {
        /* 🖤 BLACK BACKGROUND */
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, W, H);

        /* 🌟 STARS */
        stars.forEach(s => {
          ctx.beginPath();
          ctx.shadowBlur = 10;
          ctx.shadowColor = s.c;
          ctx.fillStyle = s.c;
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
          s.y += 0.3;
          if (s.y > H) s.y = 0;
        });
        ctx.shadowBlur = 0;

        /* CARD BORDER */
        ctx.lineWidth = 6;
        ctx.strokeStyle = "#22d3ee";
        roundRect(ctx, 20, 20, W - 40, H - 40, 26);
        ctx.stroke();

        /* PROFILE BORDER */
        const hue = f * 14;
        ctx.beginPath();
        ctx.arc(180, 190, 98, 0, Math.PI * 2);
        ctx.strokeStyle = `hsl(${hue},100%,60%)`;
        ctx.lineWidth = 5;
        ctx.shadowBlur = 18;
        ctx.shadowColor = `hsl(${hue},100%,60%)`;
        ctx.stroke();
        ctx.shadowBlur = 0;

        /* PROFILE IMAGE */
        if (avatar) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(180, 190, 92, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(avatar, 88, 98, 184, 184);
          ctx.restore();
        }

        /* LEFT SIDE INFO (AS REQUESTED) */
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 24px Arial";
        ctx.fillText(`Nickname : ${user.name || "N/A"}`, 60, 360);
        ctx.fillText(`Username : ${user.username || "N/A"}`, 60, 395);
        ctx.fillText(`Money Rank : #${user.rank || "N/A"}`, 60, 430);
        ctx.fillText(
          `BotFriend : ${user.isBot ? "YES" : "NO"}`,
          60,
          465
        );

        /* RIGHT SIDE MAIN INFO (UNCHANGED STYLE) */
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 42px Arial";
        ctx.fillText(user.name || "UNKNOWN", 330, 120);

        ctx.fillStyle = user.isBot ? "#ff4444" : "#22c55e";
        ctx.font = "24px Arial";
        ctx.fillText(
          user.isBot ? "BOT FRIEND" : "NORMAL USER",
          330,
          160
        );

        ctx.fillStyle = "#9ca3af";
        ctx.font = "22px monospace";
        ctx.fillText(`TARGET ID :: ${uid}`, 330, 200);
        ctx.fillText(`LEVEL :: ${user.level || 1}`, 330, 235);
        ctx.fillText(`EXP :: ${formatBalance(user.exp || 0)}`, 330, 270);
        ctx.fillText(`BALANCE :: ${formatBalance(user.money || 0)}`, 330, 305);

        encoder.addFrame(ctx);
      }

      encoder.finish();
      await new Promise(r => setTimeout(r, 300));

      api.sendMessage(
        {
          body: "🕵️ CYBER SPY PROFILE",
          attachment: fs.createReadStream(gifPath)
        },
        event.threadID,
        () => {
          if (fs.existsSync(gifPath)) fs.unlinkSync(gifPath);
        }
      );

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Spy card generate failed!", event.threadID);
    }
  }
};