const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");
const axios = require("axios");

const API_BASE = "https://yt-tt.onrender.com";

module.exports = {
  config: {
    name: "vidz",
    aliases: ["ytsearch", "ytlist"],
    version: "2.1.1",
    author: "HERO + ChatGPT",
    countDown: 5,
    role: 0,
    description: "Search and download YouTube videos",
    category: "media",
    usages: "[video name] [optional result count]"
  },

  // 🔍 SEARCH PART
  onStart: async function ({ api, event, args }) {
    if (!args.length) {
      return api.sendMessage(
        "🎬 দয়া করে ভিডিও নাম লিখুন!",
        event.threadID,
        event.messageID
      );
    }

    let resultCount = 6;
    const lastArg = args[args.length - 1];

    if (!isNaN(lastArg)) {
      resultCount = Math.min(parseInt(lastArg), 20);
      args.pop();
    }

    const videoName = args.join(" ");

    try {
      const searchResults = await ytSearch(videoName);

      if (!searchResults.videos.length) {
        return api.sendMessage(
          "❌ কোনো ভিডিও পাওয়া যায়নি!",
          event.threadID,
          event.messageID
        );
      }

      const topResults = searchResults.videos.slice(0, resultCount);
      let msg = `🎬 নিচের ${topResults.length}টা ভিডিও থেকে একটি সিলেক্ট করুন:\n\n`;

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      let attachments = [];

      for (let i = 0; i < topResults.length; i++) {
        const video = topResults[i];
        msg += `${i + 1}. ${video.title} (${video.timestamp})\n`;

        const thumbPath = path.join(
          cacheDir,
          `thumb_${event.senderID}_${i}.jpg`
        );

        const response = await axios.get(video.thumbnail, {
          responseType: "arraybuffer"
        });

        fs.writeFileSync(thumbPath, response.data);
        attachments.push(fs.createReadStream(thumbPath));
      }

      api.sendMessage(
        { body: msg, attachment: attachments },
        event.threadID,
        (err, info) => {
          if (err) return;

          // ✅ এখানে FIX করা হয়েছে
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "vidz",
            author: event.senderID,
            messageID: info.messageID,
            videos: topResults,
            thumbs: topResults.map((_, i) =>
              path.join(cacheDir, `thumb_${event.senderID}_${i}.jpg`)
            )
          });
        },
        event.messageID
      );
    } catch (e) {
      console.error(e);
      api.sendMessage(
        "❌ ভিডিও সার্চ করতে সমস্যা হয়েছে!",
        event.threadID,
        event.messageID
      );
    }
  },

  // ⬇️ DOWNLOAD PART
  onReply: async function ({ api, event, Reply }) {
    if (event.senderID !== Reply.author) return;

    const choice = parseInt(event.body);
    if (isNaN(choice) || choice < 1 || choice > Reply.videos.length) {
      return api.sendMessage(
        "❌ সঠিক সংখ্যা লিখুন!",
        event.threadID,
        event.messageID
      );
    }

    const video = Reply.videos[choice - 1];
    const filePath = path.join(__dirname, "cache", `${Date.now()}.mp4`);

    try {
      const res = await axios.get(
        `${API_BASE}/api/youtube/video`,
        {
          params: { url: video.url },
          responseType: "arraybuffer",
          timeout: 120000
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
          // 🧹 CLEAN UP
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          Reply.thumbs.forEach(t => fs.existsSync(t) && fs.unlinkSync(t));
          api.unsendMessage(Reply.messageID);
        },
        event.messageID
      );
    } catch (err) {
      console.error(err);
      api.sendMessage(
        "❌ ভিডিও ডাউনলোড করতে সমস্যা হয়েছে!",
        event.threadID,
        event.messageID
      );
    }
  }
};