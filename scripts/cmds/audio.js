const fs = require("fs");
const path = require("path");
const axios = require("axios");
const ytSearch = require("yt-search");

const nix = "https://raw.githubusercontent.com/aryannix/stuffs/master/raw/apis.json";

async function getBaseApi() {
  const res = await axios.get(nix);
  if (!res.data || !res.data.api) throw new Error("API not found");
  return res.data.api;
}

async function downloadAudio(baseApi, url, api, event, title = null) {
  try {
    const apiUrl = `${baseApi}/play?url=${encodeURIComponent(url)}`;
    const res = await axios.get(apiUrl);
    const data = res.data;

    if (!data.status || !data.downloadUrl)
      throw new Error("API failed to return download URL.");

    const songTitle = title || data.title;
    const fileName = `${songTitle}.mp3`.replace(/[\\/:"*?<>|]/g, "");
    const filePath = path.join(__dirname, fileName);

    const songData = await axios.get(data.downloadUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(filePath, songData.data);

    await api.sendMessage(
      { body: `🎵 ${songTitle}`, attachment: fs.createReadStream(filePath) },
      event.threadID,
      () => fs.unlinkSync(filePath),
      event.messageID
    );
  } catch (err) {
    console.error(err);
    api.sendMessage(`❌ Failed to download audio: ${err.message}`, event.threadID, event.messageID);
  }
}

module.exports = {
  config: {
    name: "audios",
    aliases: ["audio"],
    version: "1.1.0",
    author: "HERO + ChatGPT",
    countDown: 5,
    role: 0,
    description: "Search and download YouTube audio/mp3",
    category: "media",
    usages: "audios <song name> [result count]"
  },

  onStart: async function ({ api, event, args, commandName }) {
    if (!args.length)
      return api.sendMessage("❌ গান বা YouTube URL লিখুন!", event.threadID, event.messageID);

    let baseApi;
    try {
      baseApi = await getBaseApi();
    } catch {
      return api.sendMessage("❌ API লোড করা যায়নি!", event.threadID, event.messageID);
    }

    // 🔢 RESULT LIMIT LOGIC
    let limit = 6;
    const lastArg = args[args.length - 1];
    if (!isNaN(lastArg)) {
      limit = Math.min(parseInt(lastArg), 20);
      args.pop();
    }

    const query = args.join(" ");

    // DIRECT URL
    if (query.startsWith("http")) {
      return downloadAudio(baseApi, query, api, event);
    }

    try {
      const search = await ytSearch(query);
      const videos = search.videos.slice(0, limit);

      if (!videos.length)
        return api.sendMessage("❌ কোনো ফলাফল পাওয়া যায়নি!", event.threadID, event.messageID);

      let msg = "🎶 নিচের ভিডিও থেকে একটি গান সিলেক্ট করুন:\n\n";
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const attachments = [];

      for (let i = 0; i < videos.length; i++) {
        const v = videos[i];
        msg += `${i + 1}. ${v.title}\n⏱ ${v.timestamp}\n👀 ${v.views}\n\n`;

        const thumbPath = path.join(cacheDir, `thumb_${event.senderID}_${i}.jpg`);
        const img = await axios.get(v.thumbnail, { responseType: "arraybuffer" });
        fs.writeFileSync(thumbPath, img.data);
        attachments.push(fs.createReadStream(thumbPath));
      }

      api.sendMessage(
        {
          body: msg + `Reply with number (1-${videos.length}) to download audio`,
          attachment: attachments
        },
        event.threadID,
        (err, info) => {
          if (err) return console.error(err);

          global.GoatBot.onReply.set(info.messageID, {
            results: videos,
            messageID: info.messageID,
            author: event.senderID,
            commandName,
            baseApi,
            thumbs: videos.map((_, i) =>
              path.join(cacheDir, `thumb_${event.senderID}_${i}.jpg`)
            )
          });
        },
        event.messageID
      );
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ YouTube search ব্যর্থ!", event.threadID, event.messageID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    if (event.senderID !== Reply.author) return;

    const choice = parseInt(event.body);
    if (isNaN(choice) || choice < 1 || choice > Reply.results.length)
      return api.sendMessage("❌ সঠিক সংখ্যা দিন!", event.threadID, event.messageID);

    const selected = Reply.results[choice - 1];
    await api.unsendMessage(Reply.messageID);

    downloadAudio(Reply.baseApi, selected.url, api, event, selected.title);
  }
};