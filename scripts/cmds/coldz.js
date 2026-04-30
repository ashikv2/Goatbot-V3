const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");
const { exec } = require("child_process");

const QUALITIES = ["144", "240", "360", "480", "720", "1080"];

module.exports = {
  config: {
    name: "coldz",
    aliases: ["cold", "ytcold"],
    version: "3.0.0",
    author: "HERO + ChatGPT",
    countDown: 5,
    role: 0,
    description: "YouTube video download with yt-dlp (144p–1080p)",
    category: "media",
    usages: "[video name]"
  },

  onStart: async function ({ api, event, args }) {
    if (!args.length)
      return api.sendMessage("🎬 ভিডিও নাম লিখুন!", event.threadID);

    try {
      const results = await ytSearch(args.join(" "));
      if (!results.videos.length)
        return api.sendMessage("❌ ভিডিও পাওয়া যায়নি!", event.threadID);

      const videos = results.videos.slice(0, 6);
      let msg = "🎬 ভিডিও সিলেক্ট করুন:\n\n";
      videos.forEach((v, i) => {
        msg += `${i + 1}. ${v.title} (${v.timestamp})\n`;
      });

      api.sendMessage(msg, event.threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "coldz",
          step: "video",
          author: event.senderID,
          videos
        });
      });
    } catch (e) {
      console.error(e);
      api.sendMessage("❌ সার্চ করতে সমস্যা হয়েছে!", event.threadID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    if (event.senderID !== Reply.author) return;

    // STEP 1: VIDEO SELECT
    if (Reply.step === "video") {
      const index = parseInt(event.body) - 1;
      if (isNaN(index) || !Reply.videos[index])
        return api.sendMessage("❌ সঠিক নাম্বার দিন!", event.threadID);

      let qMsg = "🎚️ কোয়ালিটি বেছে নিন (default 480p):\n\n";
      QUALITIES.forEach((q, i) => {
        qMsg += `${i + 1}. ${q}p${q === "480" ? " (Default)" : ""}\n`;
      });

      api.sendMessage(qMsg, event.threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "coldz",
          step: "quality",
          author: event.senderID,
          video: Reply.videos[index]
        });
      });
      return;
    }

    // STEP 2: QUALITY + yt-dlp DOWNLOAD
    if (Reply.step === "quality") {
      let qIndex = parseInt(event.body) - 1;
      let chosenQuality = QUALITIES[qIndex] || "480"; // default 480p

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const filePath = path.join(cacheDir, `${Date.now()}.mp4`);
      const videoUrl = Reply.video.url;

      // yt-dlp command
      const ytdlpCmd = `yt-dlp -f "bestvideo[height<=${chosenQuality}]+bestaudio/best[height<=${chosenQuality}]" -o "${filePath}" "${videoUrl}"`;

      api.sendMessage(`⬇️ ${chosenQuality}p ভিডিও ডাউনলোড হচ্ছে...`, event.threadID);

      exec(ytdlpCmd, (error, stdout, stderr) => {
        if (error) {
          console.error(error);
          return api.sendMessage("❌ ভিডিও ডাউনলোড ব্যর্থ!", event.threadID);
        }

        api.sendMessage(
          {
            body: `🎬 ${Reply.video.title}\n🎚️ Quality: ${chosenQuality}p`,
            attachment: fs.createReadStream(filePath)
          },
          event.threadID,
          () => fs.existsSync(filePath) && fs.unlinkSync(filePath)
        );
      });
    }
  }
};