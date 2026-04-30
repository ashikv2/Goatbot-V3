const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "pair2",
    version: "2.0.0",
    author: "KASHIF RAZA (Converted to Canvas by Ashik)",
    role: 0,
    category: "love",
    guide: "{pn} @mention(optional)",
    countDown: 5
  },

  onStart: async function ({ api, event, Users }) {
    const { threadID, messageID, senderID, mentions } = event;

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const bgPath = path.join(cacheDir, "pair2_bg.png");
    const avt1Path = path.join(cacheDir, "pair2_1.png");
    const avt2Path = path.join(cacheDir, "pair2_2.png");

    const templateUrl = "https://i.ibb.co/Zptb9xJ2/803a8e8cc475.jpg";

    const romanticMessages = [
      "𝐘𝐨𝐮 𝐚𝐫𝐞 𝐦𝐲 𝐬𝐮𝐧𝐬𝐡𝐢𝐧𝐞 ☀️",
      "𝐃𝐞𝐬𝐭𝐢𝐧𝐞𝐝 𝐭𝐨 𝐛𝐞 𝐭𝐨𝐠𝐞𝐭𝐡𝐞𝐫 💫",
      "𝐌𝐲 𝐡𝐞𝐚𝐫𝐭 𝐛𝐞𝐚𝐭𝐬 𝐟𝐨𝐫 𝐲𝐨𝐮 💓",
      "𝐅𝐨𝐫𝐞𝐯𝐞𝐫 𝐚𝐧𝐝 𝐚𝐥𝐰𝐚𝐲𝐬 💝"
    ];

    try {
      /* ===== BACKGROUND ===== */
      const bgData = await axios.get(templateUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(bgPath, Buffer.from(bgData.data));

      /* ===== USER SELECT ===== */
      let id1 = senderID;
      let id2;

      const mentionIDs = Object.keys(mentions || {});
      if (mentionIDs[0]) {
        id2 = mentionIDs[0];
      } else {
        const threadInfo = await api.getThreadInfo(threadID);
        const members = threadInfo.participantIDs.filter(id => id !== id1);
        if (!members.length) {
          return api.sendMessage("❌ Pair করার মতো কেউ নেই!", threadID, messageID);
        }
        id2 = members[Math.floor(Math.random() * members.length)];
      }

      /* ===== AVATARS ===== */
      const avt1 = await axios.get(
        `https://graph.facebook.com/${id1}/picture?width=720&height=720`,
        { responseType: "arraybuffer" }
      );
      fs.writeFileSync(avt1Path, Buffer.from(avt1.data));

      const avt2 = await axios.get(
        `https://graph.facebook.com/${id2}/picture?width=720&height=720`,
        { responseType: "arraybuffer" }
      );
      fs.writeFileSync(avt2Path, Buffer.from(avt2.data));

      /* ===== CANVAS DRAW ===== */
      const bgImg = await loadImage(bgPath);
      const img1 = await loadImage(avt1Path);
      const img2 = await loadImage(avt2Path);

      const canvas = createCanvas(bgImg.width, bgImg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      // avatar positions (same as your Jimp logic)
      ctx.drawImage(img1, 10, 5, 230, 230);
      ctx.drawImage(img2, 245, 5, 230, 230);

      const outPath = path.join(cacheDir, `pair2_${Date.now()}.png`);
      fs.writeFileSync(outPath, canvas.toBuffer());

      /* ===== MESSAGE ===== */
      const name1 = await Users.getNameUser(id1);
      const name2 = await Users.getNameUser(id2);
      const loveMsg = romanticMessages[Math.floor(Math.random() * romanticMessages.length)];

      api.sendMessage(
        {
          body: `💞 ${loveMsg}\n\n👤 ${name1}\n✨ PAIRED WITH ✨\n👤 ${name2}`,
          attachment: fs.createReadStream(outPath),
          mentions: [
            { id: id1, tag: name1 },
            { id: id2, tag: name2 }
          ]
        },
        threadID,
        () => {
          fs.unlinkSync(outPath);
          fs.unlinkSync(bgPath);
          fs.unlinkSync(avt1Path);
          fs.unlinkSync(avt2Path);
        },
        messageID
      );

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Pair বানাতে সমস্যা হয়েছে!", threadID, messageID);
    }
  }
};