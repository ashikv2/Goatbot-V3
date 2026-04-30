const fs = require("fs");
const path = require("path");
const axios = require("axios");

const API_BASE = "https://yt-tt.onrender.com";

module.exports = {
  config: {
    name: "yt2",
    aliases: ["ytvs", "ytm"],
    version: "3.1.0",
    author: "HERO + ChatGPT",
    countDown: 5,
    role: 0,
    description: "Direct YouTube video download via link",
    category: "media",
    usages: "[YouTube video link]"
  },

  onStart: async function ({ api, event, args }) {
    if (!args.length)
      return api.sendMessage(
        "🎬 দয়া করে ভিডিও লিংক দিন!",
        event.threadID,
        event.messageID
      );

    const videoUrl = args[0];
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const filePath = path.join(cacheDir, `${Date.now()}.mp4`);

    try {
      api.sendMessage(
        "⏳ ভিডিও ডাউনলোড হচ্ছে, একটু অপেক্ষা করুন...",
        event.threadID,
        event.messageID
      );

      const res = await axios.get(`${API_BASE}/api/youtube/video`, {
        params: { url: videoUrl },
        responseType: "arraybuffer",
        timeout: 180000
      });

      fs.writeFileSync(filePath, Buffer.from(res.data));

      api.sendMessage(
        {
          body: `🎬 ভিডিও ডাউনলোড সম্পন্ন!`,
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        },
        event.messageID
      );
    } catch (e) {
      console.error(e);
      api.sendMessage(
        "❌ ভিডিও ডাউনলোড করতে সমস্যা হয়েছে!",
        event.threadID,
        event.messageID
      );
    }
  }
};