const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const GhibliArts = require("mahabub-ghibli-arts");

module.exports = {
  config: {
    name: "ghibli",
    version: "1.0.2",
    author: "MR𒆜MAHABUB𒆜 メ✓",
    countDown: 10,
    role: 0,
    shortDescription: "Turn image into Ghibli-style art",
    longDescription: "Transforms a replied image into Studio Ghibli-style artwork using mahabub-ghibli-arts.",
    category: "ai",
    guide: {
      en: "Reply to an image and type {pn} to generate Ghibli-style art."
    }
  },

  onStart: async function ({ api, event }) {
    try {
      // Check for replied image
      if (
        !event.messageReply ||
        !event.messageReply.attachments ||
        event.messageReply.attachments.length === 0 ||
        event.messageReply.attachments[0].type !== "photo"
      ) {
        return api.sendMessage(
          "🌸 | Please reply to an image and type !ghibli to transform it into Ghibli art!",
          event.threadID,
          event.messageID
        );
      }

      const imageUrl = event.messageReply.attachments[0].url;
      api.sendMessage("🎨 | Applying Ghibli-style magic... please wait!", event.threadID, event.messageID);

      // Create cache paths
      const cacheDir = path.join(process.cwd(), "cache");
      await fs.ensureDir(cacheDir);
      const inputPath = path.join(cacheDir, `input_${Date.now()}.jpg`);
      const outputPath = path.join(cacheDir, `ghibli_${Date.now()}.jpg`);

      // Download image to inputPath
      const image = await axios.get(imageUrl, { responseType: "arraybuffer" });
      await fs.writeFile(inputPath, Buffer.from(image.data));

      // Apply Ghibli effect
      await GhibliArts.ghiblify(inputPath, outputPath);

      // Send the transformed image
      api.sendMessage(
        {
          body: "🌸 | Here’s your Ghibli-style artwork!",
          attachment: fs.createReadStream(outputPath)
        },
        event.threadID,
        async () => {
          await fs.remove(inputPath);
          await fs.remove(outputPath);
        },
        event.messageID
      );
    } catch (error) {
      console.error("❌ Ghibli Error:", error);
      api.sendMessage("❌ | Failed to generate Ghibli art. Please try again later.", event.threadID, event.messageID);
    }
  }
};