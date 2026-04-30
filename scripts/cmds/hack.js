// hack.js
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "hack",
  version: "1.0.1",
  hasPermission: 0,
  prefix: true,
  premium: false,
  commandCategory: "group",
  credits: "Kashif Razz",
  description: "hack via external API (no canvas) — uses api.getUserInfo to get name",
  usages: "@mention",
  dependencies: {
    "axios": "",
    "fs-extra": ""
  },
  cooldowns: 0
};

// 🔴 run ❌ → onStart ✅
module.exports.onStart = async function ({ args, Users, Threads, api, event, Currencies }) {
  const cacheDir = path.join(__dirname, "cache");
  const pathImg = path.join(cacheDir, "hack_result.png");

  // Helper: get name using api.getUserInfo
  const getNameFromApi = (userId) => new Promise((resolve) => {
    try {
      api.getUserInfo(userId, (err, userInfo) => {
        if (err) return resolve(null);
        if (!userInfo || !userInfo[userId]) return resolve(null);
        resolve(userInfo[userId].name || null);
      });
    } catch (e) {
      resolve(null);
    }
  });

  try {
    // Target user (mention or sender)
    const mentioned = Object.keys(event.mentions || {});
    const targetId = mentioned.length ? mentioned[0] : event.senderID;

    // Get user name
    let targetName = await getNameFromApi(targetId);

    // Fallback
    if (!targetName && typeof Users?.getNameUser === "function") {
      try {
        targetName = await Users.getNameUser(targetId);
      } catch {}
    }

    if (!targetName) targetName = "Unknown";

    // API URL
    const apiUrl = `http://172.81.128.14:20541/hack?userId=${encodeURIComponent(targetId)}&name=${encodeURIComponent(targetName)}`;

    await fs.ensureDir(cacheDir);

    const res = await axios.get(apiUrl, {
      responseType: "arraybuffer",
      timeout: 20000
    });

    const contentType = res.headers?.["content-type"] || "";
    if (!contentType.startsWith("image/")) {
      return api.sendMessage(
        "❌ API image রিটার্ন করেনি",
        event.threadID,
        event.messageID
      );
    }

    fs.writeFileSync(pathImg, Buffer.from(res.data));

    return api.sendMessage(
      {
        body: `💀 Good Luck!\n🔓 ${targetName} hacked successfully!\n📩 Password sent to owner.`,
        attachment: fs.createReadStream(pathImg)
      },
      event.threadID,
      () => {
        try { fs.unlinkSync(pathImg); } catch {}
      },
      event.messageID
    );

  } catch (err) {
    console.error("hack command error:", err);
    return api.sendMessage(
      `❌ Hack failed!\n${err.message || err}`,
      event.threadID,
      event.messageID
    );
  }
};