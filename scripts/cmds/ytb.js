const axios = require("axios");
const fs = require("fs");
const path = require("path");

const nix = "https://raw.githubusercontent.com/aryannix/stuffs/master/raw/apis.json";

async function downloadSong(baseApi, url, api, event, title = null) {
  try {
    const apiUrl = `${baseApi}/play?url=${encodeURIComponent(url)}`;
    const res = await axios.get(apiUrl);
    const data = res.data;

    if (!data.status || !data.downloadUrl)
      throw new Error("API failed to return download URL.");

    const songTitle = title || data.title || "audio";
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
    api.sendMessage(`❌ Failed to download song: ${err.message}`, event.threadID, event.messageID);
  }
}

module.exports = {
  config: {
    name: "ytd3",
    aliases: ["youtube", "yt"],
    version: "1.0.1",
    author: "ArYAN",
    countDown: 5,
    role: 0,
    shortDescription: "Direct MP3 download from YouTube link",
    longDescription: "Download audio directly from YouTube using a link",
    category: "MUSIC",
    guide: "/sing <YouTube URL>"
  },

  onStart: async function ({ api, event, args }) {
    if (!args.length)
      return api.sendMessage("❌ শুধু ইউটিউব লিংক দাও", event.threadID, event.messageID);

    const url = args[0];
    if (!url.startsWith("http"))
      return api.sendMessage("❌ শুধুমাত্র ইউটিউব লিংক সমর্থিত", event.threadID, event.messageID);

    let baseApi;
    try {
      const configRes = await axios.get(nix);
      baseApi = configRes.data?.api;
      if (!baseApi) throw new Error("Missing API");
    } catch {
      return api.sendMessage("❌ API configuration fetch failed", event.threadID, event.messageID);
    }

    downloadSong(baseApi, url, api, event);
  }
};