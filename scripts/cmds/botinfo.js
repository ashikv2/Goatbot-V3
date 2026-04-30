const os = require("os");

module.exports = {
  config: {
    name: "botinfo",
    aliases: ["stats", "status"],
    version: "1.0.0",
    author: "ChatGPT",
    role: 0,
    shortDescription: "Bot & Server information",
    longDescription: "Shows bot info, server stats and system info",
    category: "system",
    guide: "{pn}"
  },

  onStart: async function ({ message, threadsData, usersData }) {
    try {
      const uptime = process.uptime();

      const days = Math.floor(uptime / (3600 * 24));
      const hours = Math.floor((uptime % (3600 * 24)) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;

      const formatGB = bytes => (bytes / 1024 / 1024 / 1024).toFixed(2);

      const users = await usersData.getAll();
      const threads = await threadsData.getAll();

      const msg =
`╔═╤═══════╤═╗
║ ░🎃🎆 BOT INFO 🎇░ ║
╠═╧═══════╧═╣
║ 👤 Users       ▸ ${users.length} 🧑‍🤝‍🧑
║ 💬 Groups      ▸ ${threads.length} 🗨️
║ 📃 Commands    ▸ ${global.GoatBot.commands.size} ⚡
║ ⏲️ Uptime      ▸ ${days}d ${hours}h ${minutes}m ${seconds}s ⏳
║ 📶 Ping        ▸ ${Date.now() - message.timestamp}ms 📡
║ 🧩 Owner       ▸ Ashik_🧨 🎩
╚════════════╝

╔═╤═══════╤═╗
║ ░🖥💻 SERVER STATS 💻░ ║
╠═╧═══════╧═╣
║ 🧠 RAM        ▸ ${formatGB(usedMem)}GB / ${formatGB(totalMem)}GB 💾
║ 💽 Disk       ▸ N/A 🗄️
║ 📱 CPU       ▸ ${os.cpus()[0].model} 🛠️
║ 🔢 Cores     ▸ ${os.cpus().length} 🖇️
║ 🏮 CPU Usage ▸ ${(os.loadavg()[0] * 100).toFixed(2)}% 🌡️
╚════════════╝

╔═╤═══════╤═╗
║ ░⚙️📱 SYSTEM 📱⚙️░ ║
╠═╧═══════╧═╣
║ 🖥 OS           ▸ ${os.type()} ${os.release()} 🐧
║ 📥 Node.js      ▸ ${process.version} 📦
║ 🔒 Media Banned ▸ ❌ No ⚠️
╚════════════╝`;

      return message.reply(msg);

    } catch (err) {
      return message.reply("❌ Bot info load করতে সমস্যা হয়েছে!");
    }
  }
};