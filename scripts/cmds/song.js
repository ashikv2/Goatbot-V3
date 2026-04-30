const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");
const axios = require("axios");

const API_BASE = "https://yt-tt.onrender.com";

module.exports = {
  config: {
    name: "song",
    aliases: ["yt4", "ytm4"],
    version: "3.0.0",
    author: "HERO + ChatGPT",
    countDown: 5,
    role: 0,
    description: "Direct YouTube video download",
    category: "media",
    usages: "[video name]"
  },

  onStart: async function ({ api, event, args }) {
    if (!args.length)
      return api.sendMessage(
        "🎬 দয়া করে ভিডিও নাম লিখুন!",
        event.threadID,
        event.messageID
      );

    const videoName = args.join(" ");
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    try {
      const searchResults = await ytSearch(videoName);
      if (!searchResults.videos.length)
        return api.sendMessage(
          "❌ কোনো ভিডিও পাওয়া যায়নি!",
          event.threadID,
          event.messageID
        );

      // 🔥 প্রথম ভিডিও সরাসরি নেওয়া
      const video = searchResults.videos[0];
      const filePath = path.join(cacheDir, `${Date.now()}.mp4`);

      api.sendMessage(
        "⏳ ভিডিও ডাউনলোড হচ্ছে, একটু অপেক্ষা করুন...",
        event.threadID,
        event.messageID
      );

      const res = await axios.get(
        `${API_BASE}/api/youtube/video`,
        {
          params: { url: video.url },
          responseType: "arraybuffer",
          timeout: 180000
        }
      );

      fs.writeFileSync(filePath, Buffer.from(res.data));

      api.sendMessage(
        {
          body: `🎬 ${video.title}\n📺 ${video.author.name}`,
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