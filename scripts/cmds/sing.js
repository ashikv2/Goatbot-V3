const a = require("axios");
const b = require("fs");
const c = require("path");
const d = require("yt-search");

const nix = "https://raw.githubusercontent.com/aryannix/stuffs/master/raw/apis.json";

async function downloadSong(baseApi, url, api, event, title = null) {
  try {
    const apiUrl = `${baseApi}/play?url=${encodeURIComponent(url)}`;
    const res = await a.get(apiUrl);
    const data = res.data;

    if (!data.status || !data.downloadUrl)
      throw new Error("API failed to return download URL.");

    const songTitle = title || data.title || "audio";
    const fileName = `${songTitle}.mp3`.replace(/[\\/:"*?<>|]/g, "");
    const filePath = c.join(__dirname, fileName);

    const songData = await a.get(data.downloadUrl, { responseType: "arraybuffer" });
    b.writeFileSync(filePath, songData.data);

    await api.sendMessage(
      {
        body: `🎵 ${songTitle}`,
        attachment: b.createReadStream(filePath)
      },
      event.threadID,
      () => b.unlinkSync(filePath),
      event.messageID
    );
  } catch (err) {
    console.error(err);
    api.sendMessage(`❌ Failed to download song: ${err.message}`, event.threadID, event.messageID);
  }
}

module.exports = {
  config: {
    name: "sing",
    aliases: ["music", "mp3"],
    version: "1.0.0",
    author: "ArYAN",
    countDown: 5,
    role: 0,
    shortDescription: "Direct MP3 download",
    longDescription: "Download audio directly from YouTube",
    category: "MUSIC",
    guide: "/sing <song name or YouTube URL>"
  },

  onStart: async function ({ api, event, args }) {
    let baseApi;
    try {
      const configRes = await a.get(nix);
      baseApi = configRes.data?.api;
      if (!baseApi) throw new Error("Missing API");
    } catch {
      return api.sendMessage(
        "❌ Failed to fetch API configuration.",
        event.threadID,
        event.messageID
      );
    }

    if (!args.length)
      return api.sendMessage(
        "❌ গান নাম বা YouTube লিংক দাও",
        event.threadID,
        event.messageID
      );

    const query = args.join(" ");

    try {
      // যদি URL হয়
      if (query.startsWith("http")) {
        return downloadSong(baseApi, query, api, event);
      }

      // নাম দিলে প্রথম রেজাল্ট অটো নেবে
      const res = await d(query);
      if (!res.videos.length)
        return api.sendMessage("❌ কোনো গান পাওয়া যায়নি", event.threadID, event.messageID);

      const video = res.videos[0];
      downloadSong(baseApi, video.url, api, event, video.title);

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ অডিও ডাউনলোড করা যায়নি", event.threadID, event.messageID);
    }
  }
};