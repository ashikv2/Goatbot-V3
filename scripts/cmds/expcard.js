const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const cacheDir = path.join(__dirname, "cache");

module.exports = {
  config: {
    name: "expcard",
    version: "5.0.0",
    author: "Ashik + ChatGPT",
    role: 0,
    category: "user",
    guide: "{pn}",
    countDown: 5
  },

  // ================= PROFILE IMAGE =================
  async getProfile(uid) {
    try {
      const url = `https://graph.facebook.com/${uid}/picture?width=512&height=512`;
      const res = await axios.get(url, { responseType: "arraybuffer" });
      return await loadImage(res.data);
    } catch {
      return null;
    }
  },

  // ================= START =================
  onStart: async function ({ event, usersData, message }) {
    try {
      const uid = event.senderID;
      const userData = await usersData.get(uid) || {};

      let level = userData.level || 1;
      let exp = userData.exp || 0;
      const name = userData.name || "Unknown User";

      // ================= AUTO LEVEL SYSTEM =================
      while (exp >= level * 100) {
        exp -= level * 100;
        level++;
      }

      await usersData.set(uid, {
        ...userData,
        level,
        exp
      });

      const needExp = level * 100;
      const progress = Math.min(exp / needExp, 1);

      // ================= CANVAS =================
      const width = 900;
      const height = 260;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // ---------- Background ----------
      const bg = ctx.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, "#14002b");
      bg.addColorStop(1, "#3b0066");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // ---------- Avatar ----------
      const avatar = await this.getProfile(uid);
      const ax = 60, ay = 60, size = 140;

      ctx.save();
      ctx.beginPath();
      ctx.arc(ax + size / 2, ay + size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      if (avatar) {
        ctx.drawImage(avatar, ax, ay, size, size);
      } else {
        ctx.fillStyle = "#555";
        ctx.fillRect(ax, ay, size, size);
      }
      ctx.restore(); // 🔥 MUST

      // ---------- Name ----------
      ctx.fillStyle = "#e6b3ff";
      ctx.font = "bold 38px Sans";
      ctx.fillText(name, 230, 90);

      // ---------- Level ----------
      ctx.font = "bold 30px Sans";
      ctx.fillText(`Lv ${level}`, 760, 70);

      // ---------- EXP Text ----------
      ctx.font = "24px Sans";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`EXP ${exp} / ${needExp}`, 230, 140);

      // ---------- EXP Bar ----------
      const barX = 230, barY = 160, barW = 420, barH = 24;

      ctx.fillStyle = "#2a003d";
      ctx.fillRect(barX, barY, barW, barH);

      const grad = ctx.createLinearGradient(barX, barY, barX + barW, barY);
      grad.addColorStop(0, "#9b4dff");
      grad.addColorStop(1, "#ff7ae6");

      ctx.fillStyle = grad;
      ctx.fillRect(barX, barY, barW * progress, barH);

      // ================= SAVE & SEND =================
      await fs.ensureDir(cacheDir);
      const imgPath = path.join(cacheDir, `expcard_${uid}.png`);
      fs.writeFileSync(imgPath, canvas.toBuffer());

      await message.reply({
        body: "✨ Your EXP Card",
        attachment: fs.createReadStream(imgPath)
      });

    } catch (err) {
      console.error(err);
      message.reply("❌ EXP Card বানানো যায়নি");
    }
  }
};