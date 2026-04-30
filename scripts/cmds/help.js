const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "help",
    aliases: ["menu", "commands"],
    version: "5.0",
    author: "ASHIK",
    shortDescription: "Show all commands",
    longDescription: "Displays all available commands with categories and detailed command info.",
    category: "system",
    guide: "{pn}help | {pn}help <command>"
  },

  onStart: async function ({ message, args, prefix }) {
    const commands = [...global.GoatBot.commands.values()];

    /* ================= COMMAND INFO ================= */
    if (args[0]) {
      const query = args[0].toLowerCase();

      const cmd = commands.find(c =>
        c.config.name === query ||
        (c.config.aliases || []).includes(query)
      );

      if (!cmd) {
        return message.reply(`❌ Command "${query}" not found.`);
      }

      const cfg = cmd.config;

      return message.reply(
        `╔═══════════════ ⌈ 🔎 COMMAND INFO 🔎 ⌋ ═══════════════╗\n` +
        `║ 🏷️ Name        : ${cfg.name}\n` +
        `║ 🧩 Category    : ${cfg.category || "Uncategorized"}\n` +
        `║ 📝 Description : ${cfg.longDescription || cfg.shortDescription || "No description"}\n` +
        `║ 🔀 Aliases     : ${(cfg.aliases && cfg.aliases.length) ? cfg.aliases.join(", ") : "None"}\n` +
        `║ 🧪 Version     : ${cfg.version || "1.0.0"}\n` +
        `║ 🔐 Permission  : ${cfg.role ?? 0}\n` +
        `║ 👨‍💻 Author      : Ashik\n` +
        `║ 📌 Usage       : ${cfg.guide ? cfg.guide.replace(/{pn}/g, prefix) : `${prefix}${cfg.name}`}\n` +
        `╚══════════════════════════════════════════════════════╝`
      );
    }

    /* ================= HELP MENU ================= */
    let msg =
      `╔════════════════════════════════════════════╗\n` +
      `║        🤖✨ 𝗔𝗦𝗛𝗜𝗞 𝗕𝗢𝗧 - 𝗛𝗘𝗟𝗣 ✨🤖        ║\n` +
      `╚════════════════════════════════════════════╝\n\n`;

    /* ===== GROUP COMMANDS BY CATEGORY ===== */
    const categories = {};

    for (const cmd of commands) {
      const cat = cmd.config.category || "Uncategorized";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(cmd.config.name);
    }

    for (const cat in categories) {
      msg += `⧉───────[ 📂 ${cat.toUpperCase()} ]───────⧉\n`;
      msg += `│ ❖ ${categories[cat].join(" ✦ ")}\n`;
      msg += `⧉────────────────────────────────⧉\n\n`;
    }

    msg +=
      `╔════════════════════════════════════════════╗\n` +
      `║ 🔎 ${prefix}help <command> → Command Info  ║\n` +
      `║ 📞 ${prefix}callad → Contact Admin         ║\n` +
      `╚════════════════════════════════════════════╝\n\n`;

    /* ===== OWNER INFO ===== */
    msg += `👑 OWNER : ✦ ASHIK ✦\n`;
    msg += `🔗 FACEBOOK : 🌐 https://www.facebook.com/profile.php?id=61578644536780\n`;
    msg += `🧾 TOTAL COMMANDS : 📜 ${commands.length}\n`;

    /* ================= IMAGE ATTACHMENT ================= */
    const imagePath = path.join(__dirname, "helppic", "banner.png");

    if (fs.existsSync(imagePath)) {
      return message.reply({
        body: msg,
        attachment: fs.createReadStream(imagePath)
      });
    } else {
      return message.reply(msg);
    }
  }
};
