const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");

module.exports = {
  config: {
    name: "medias",
    version: "2.0.1",
    hasPermssion: 0,
    credits: "SARDAR RDX",
    description: "Download YouTube music using keyword search",
    commandCategory: "Media",
    usages: "[song name] [audio/video]",
    cooldowns: 5,
    dependencies: {
      axios: "",
      "yt-search": "",
    },
  },

  // 🔹 onStart ফাংশন যোগ করা
  onStart: async function () {
    console.log(`[Music Command] Loaded successfully!`);
  },

  run: async function ({ api, event, args }) {
    if (!args.length) {
      return api.sendMessage(
        "❌ Please provide a song name.",
        event.threadID,
        event.messageID
      );
    }

    let type = "audio";
    if (["audio", "video"].includes(args[args.length - 1])) {
      type = args.pop();
    }

    const songName = args.join(" ");

    const waitMsg = await api.sendMessage(
      "⏳ Searching & processing your request...",
      event.threadID,
      null,
      event.messageID
    );

    try {
      // 🔍 Search YouTube
      const search = await ytSearch(songName);
      if (!search.videos.length) {
        throw new Error("No results found.");
      }

      const video = search.videos[0];
      const videoUrl = video.url;

      // 🎯 API request
      const apiResponse = await axios.post(
        "https://priyanshuapi.xyz/api/runner/yt-download/fetch",
        {
          url: videoUrl,
          format: type,
          quality: type === "audio" ? "128kbps" : "360p",
        },
        {
          headers: {
            Authorization:
              "Bearer apim_MS1Q8WyUSpKmsP0W5xYI-56mhpxvIK4d0NZCad4rfeU",
            "Content-Type": "application/json",
          },
        }
      );

      const data = apiResponse.data;
      if (!data.downloadUrl) {
        throw new Error("Failed to fetch download link.");
      }

      // 📥 Download file
      const ext = type === "audio" ? "m4a" : "mp4";
      const filePath = path.join(__dirname, `${Date.now()}.${ext}`);

      const fileStream = await axios.get(data.downloadUrl, {
        responseType: "stream",
      });

      const writer = fs.createWriteStream(filePath);
      fileStream.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      // 📤 Send file
      await api.sendMessage(
        {
          body: `🎶 Title: ${data.title}\n👀 Views: ${data.views}\n📥 Type: ${type}`,
          attachment: fs.createReadStream(filePath),
        },
        event.threadID,
        () => {
          fs.unlinkSync(filePath);
          api.unsendMessage(waitMsg.messageID);
        },
        event.messageID
      );
    } catch (err) {
      console.error(err);
      api.sendMessage(
        `❌ Error: ${err.message}`,
        event.threadID,
        event.messageID
      );
    }
  },
};