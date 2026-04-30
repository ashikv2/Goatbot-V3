const delay = (ms) => new Promise(res => setTimeout(res, ms));

// active roast storage (thread wise)
const activeRoast = new Map();

module.exports = {
  config: {
    name: "roast",
    aliases: ["r", "chudi"],
    version: "1.1",
    author: "BaYjid + Edit by ChatGPT",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Carry style roast loop",
    },
    longDescription: {
      en: "Roasts mentioned user line by line until stopped",
    },
    category: "Fun",
    guide: {
      en: "{pn} @mention | off",
    },
  },

  onStart: async function ({ message, event, args }) {

    /* ================= OFF SYSTEM ================= */
    if (args[0] && args[0].toLowerCase() === "off") {
      if (activeRoast.has(event.threadID)) {
        activeRoast.set(event.threadID, false);
        return message.reply("🛑 Roast mode বন্ধ করা হয়েছে!");
      } else {
        return message.reply("⚠️ এই thread-এ কোনো roast চলছে না!");
      }
    }

    /* ================= START SYSTEM ================= */
    const mentionID = Object.keys(event.mentions)[0];
    if (!mentionID) {
      return message.reply("❌ কাউকে mention না করলে roast শুরু হবে না!");
    }

    if (activeRoast.has(event.threadID)) {
      return message.reply("⚠️ এই thread-এ আগেই roast চলছে!");
    }

    const targetName = event.mentions[mentionID];
    const tag = [{ id: mentionID, tag: `@${targetName}` }];

    const roasts = [
      "Tor swag ta second-hand er moto lage bhai, ashol manush kapor er shathe shathe attitude-o dhuye ney! 😎",
      "Tui eto cringe je cringe er exam thakle tui gold medal niye bari jaitish! 🏅",
      "Tui real life er lag — ghishte ghishte cholish, kajer kichui na! 🐌",
      "Tor IQ room temperature er cheye-o thanda! ❄️",
      "Tui eto bekar je Google-o tor naam search korte voy pay! 🧐",
      "Tor confidence full 4K, kintu brain 144p! 📉",
      "Tui joke korle lokjon ghumay — dangerous talent! 💤",
      "Tui real life er pop-up ad — biroktikor ar dorkar chara! 🚫",
      "Tor vibe Bluetooth er moto — connect kokhonoi stable na! 📶",
      "Tui eto lost je Google Maps bole ‘404 – Pawa jay nai’! 🗺️",
      "Tor ego eto boro je mathar moddhe ar kichur jayga nai! 🧱",
      "Tui background noise — main character na! 🔊",
      "Tor profile dekhe battery saver auto on hoye jay! ⚡",
      "Tor bap naki Ashik?! 🦈"
    ];

    activeRoast.set(event.threadID, true);
    message.reply(`🔥 Roast শুরু! বন্ধ করতে লিখো: roast off`);

    try {
      while (activeRoast.get(event.threadID)) {
        for (const line of roasts) {
          if (!activeRoast.get(event.threadID)) break;

          await delay(1800);
          message.reply({
            body: `@${targetName}\n${line}`,
            mentions: tag
          });
        }
      }
    } catch (err) {
      console.error(err);
      activeRoast.delete(event.threadID);
      message.reply("❌ Roast চলাকালীন error হয়েছে!");
    } finally {
      activeRoast.delete(event.threadID);
    }
  }
};