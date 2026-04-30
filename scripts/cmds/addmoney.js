module.exports = {
  config: {
    name: "adb",
    version: "1.7",
    author: "ChatGPT",
    role: 2, // Admin only
    shortDescription: "Add balance with loading effect",
    category: "ECONOMY",
    guide: {
      en: "/adb <userID> <amount>\nExample: /adb 100085xxxxxxx 5m"
    }
  },

  onStart: async function ({ args, message, usersData, api }) {
    try {
      const uid = args[0];
      let amountStr = args[1];

      if (!uid || !amountStr) {
        return message.reply(
          "❌ ব্যবহার ভুল!\n\nব্যবহার করুন:\n/adb <userID> <amount>\nউদাহরণ: /adb 10008xxxx 5m"
        );
      }

      /* 🔢 Shortcut system (k, m, b, t) */
      amountStr = amountStr.toLowerCase();
      let multi = 1;

      if (amountStr.endsWith("k")) multi = 1_000;
      else if (amountStr.endsWith("m")) multi = 1_000_000;
      else if (amountStr.endsWith("b")) multi = 1_000_000_000;
      else if (amountStr.endsWith("t")) multi = 1_000_000_000_000;

      const number = parseFloat(amountStr);
      const amount = number * multi;

      if (isNaN(amount) || amount <= 0) {
        return message.reply("❌ Amount সঠিক নয়!");
      }

      /* 👤 User check */
      const user = await usersData.get(uid);
      if (!user) return message.reply("❌ User খুঁজে পাওয়া যায়নি!");

      /* 🎮 Loading message */
      const loading = await message.reply(
        "🎮 **Processing Transaction**\n[░░░░░░░░░░] 0%"
      );
      const mid = loading.messageID;

      const wait = (ms) => new Promise(r => setTimeout(r, ms));
      const update = async (bar, percent) => {
        await api.editMessage(
          `🎮 **Processing Transaction**\n[${bar}] ${percent}%`,
          mid,
          message.threadID
        );
      };

      await wait(500); await update("█░░░░░░░░░", 10);
      await wait(500); await update("███░░░░░░░", 30);
      await wait(500); await update("█████░░░░░", 50);
      await wait(500); await update("████████░░", 80);
      await wait(500); await update("██████████", 100);

      /* ❌ Remove loading message */
      await wait(400);
      await api.unsendMessage(mid);

      /* 💰 Add balance */
      await usersData.addMoney(uid, amount);
      const newBalance = (await usersData.get(uid)).money;

      /* 👤 Get user name */
      let userName = uid;
      try {
        const info = await api.getUserInfo(uid);
        if (info[uid]?.name) userName = info[uid].name;
      } catch {}

      /* ✨ Final stylish message */
      return message.reply(
`✨━━━━━━━━━━━━━━━━━━━━✨
💸 **BALANCE ADDED SUCCESSFULLY** 💸
✨━━━━━━━━━━━━━━━━━━━━✨

👤 User : ${userName}
➕ Added : 💰 $${amount.toLocaleString()}
💎 New Balance : 💵 $${newBalance.toLocaleString()}

🔥 Transaction Completed!
✨━━━━━━━━━━━━━━━━━━━━✨`
      );

    } catch (err) {
      console.error(err);
      message.reply("❌ Unexpected error occurred!");
    }
  }
};