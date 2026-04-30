const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

/* 👤 PROFILE PICTURE – WORKING SYSTEM */
async function getProfilePicture(uid) {
  try {
    const url = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
    return await loadImage(url);
  } catch (err) {
    console.error("Profile load failed:", err.message);
    return null;
  }
}

module.exports = {
  config: {
    name: "magi",
    version: "1.2.0",
    author: "Ashik + ChatGPT",
    role: 0,
    shortDescription: "Magic love pair",
    category: "fun",
    guide: "{pn} @mention"
  },

  onStart: async function ({ event, api }) {
  onStart: async function ({ event, api }) {
  try {

    // 🔒 ADMIN ONLY CHECK
    if (!global.config.ADMINBOT.includes(event.senderID)) {
      return api.sendMessage(
        "⛔ এই কমান্ড শুধু Bot Admin ব্যবহার করতে পারবে!",
        event.threadID
      );
  }

      const senderID = event.senderID;
      const girlID = Object.keys(event.mentions)[0];

      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);

      /* 🔹 BASE IMAGE */
      const BASE_IMAGE_URL = "https://i.postimg.cc/tRhnk0rd/bad-teacher.jpg";
      const baseImagePath = path.join(cacheDir, "magi_base.jpg");

      if (!fs.existsSync(baseImagePath)) {
        const img = await axios.get(BASE_IMAGE_URL, {
          responseType: "arraybuffer"
        });
        fs.writeFileSync(baseImagePath, img.data);
      }

      const canvas = createCanvas(900, 600);
      const ctx = canvas.getContext("2d");

      const baseImg = await loadImage(baseImagePath);
      const boyImg = await getProfilePicture(senderID);
      const girlImg = await getProfilePicture(girlID);

      ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

      /* 🧑 BOY FACE – perfect position & size */
      if (boyImg) {
        const boyPos = { x: 310, y: 115, size: 110 }; // adjust according to base image
        ctx.save();
        ctx.beginPath();
        ctx.arc(boyPos.x + boyPos.size/2, boyPos.y + boyPos.size/2, boyPos.size/2, 0, Math.PI*2);
        ctx.clip();
        ctx.drawImage(boyImg, boyPos.x, boyPos.y, boyPos.size, boyPos.size);
        ctx.restore();
      }

      /* 👩 GIRL FACE – perfect position & size */
      if (girlImg) {
        const girlPos = { x: 445, y: 190, size: 110 }; // adjust according to base image
        ctx.save();
        ctx.beginPath();
        ctx.arc(girlPos.x + girlPos.size/2, girlPos.y + girlPos.size/2, girlPos.size/2, 0, Math.PI*2);
        ctx.clip();
        ctx.drawImage(girlImg, girlPos.x, girlPos.y, girlPos.size, girlPos.size);
        ctx.restore();
      }

      const outPath = path.join(cacheDir, `magi_${Date.now()}.png`);
      fs.writeFileSync(outPath, canvas.toBuffer("image/png"));

      /* 🐶 Stylish message */
      api.sendMessage(
        {
          body:
`🐾🔥 DOGGY VIBES ACTIVATED 🔥🐾
━━━━━━━━━━━━━━━━
💫 Style Match: 100%
😈 Mood: Savage & horny
🥵  Sex Energy: MAX
━━━━━━━━━━━━━━━━`,
          attachment: fs.createReadStream(outPath)
        },
        event.threadID,
        () => fs.unlink(outPath).catch(() => {})
      );

    } catch (e) {
      console.error("MAGI ERROR:", e);
      api.sendMessage("❌ কিছু একটা সমস্যা হয়েছে!", event.threadID);
    }
  }
};
