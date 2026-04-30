const fs = require("fs");
const path = require("path");

const BANK_NAME = "ANNIE'S BANK";
const DATA_PATH = path.join(__dirname, "bankData.json");

if (!fs.existsSync(DATA_PATH)) {
  fs.writeFileSync(DATA_PATH, JSON.stringify({}), "utf8");
}

function bankUI(username, body) {
  return (
`╭───〔 🏦 ${BANK_NAME} 〕───╮
│ 👤 ${username}
│──────────────────
${body}
╰────────────────────╯`
  );
}

module.exports = {
  config: {
    name: "bank",
    aliases: [],
    version: "2.0",
    author: "Loufi | SiAM | Samuel | Modified by Ashik",
    category: "💰 Economy",
    guide: "{pn} bank deposit / withdraw / balance / interest / transfer / richest / loan / payloan",
    cooldowns: 10
  },

  onStart: async function ({ args, message, event, api, usersData }) {
    const uid = event.senderID;
    const userMoney = await usersData.get(uid, "money");
    const userInfo = await api.getUserInfo(uid);
    const username = userInfo[uid].name;

    const bankData = JSON.parse(fs.readFileSync(DATA_PATH));
    if (!bankData[uid]) {
      bankData[uid] = {
        bank: 0,
        loan: 0,
        loanPayed: true,
        lastInterest: 0
      };
    }

    const cmd = args[0]?.toLowerCase();
    const amount = parseInt(args[1]);
    const target = args[2];

    /* ================= DEPOSIT ================= */
    if (cmd === "deposit") {
      if (!amount || amount <= 0)
        return message.reply(bankUI(username, "❌ Invalid deposit amount"));

      if (userMoney < amount)
        return message.reply(bankUI(username, "❌ Not enough wallet balance"));

      bankData[uid].bank += amount;
      await usersData.set(uid, { money: userMoney - amount });
    }

    /* ================= WITHDRAW ================= */
    else if (cmd === "withdraw") {
      if (!amount || amount <= 0)
        return message.reply(bankUI(username, "❌ Invalid withdraw amount"));

      if (bankData[uid].bank < amount)
        return message.reply(bankUI(username, "❌ Not enough bank balance"));

      bankData[uid].bank -= amount;
      await usersData.set(uid, { money: userMoney + amount });
    }

    /* ================= BALANCE ================= */
    else if (cmd === "balance") {
      return message.reply(
        bankUI(username,
`💰 𝗕𝗔𝗡𝗞 𝗕𝗔𝗟𝗔𝗡𝗖𝗘
━━━━━━━━━━━━━━
🏦 $${format(bankData[uid].bank)}`)
      );
    }

    /* ================= INTEREST ================= */
    else if (cmd === "interest") {
      const now = Date.now();
      if (now - bankData[uid].lastInterest < 86400000) {
        return message.reply(bankUI(username, "⏳ Interest already claimed today"));
      }

      const interest = bankData[uid].bank * 0.001;
      bankData[uid].bank += interest;
      bankData[uid].lastInterest = now;

      return message.reply(
        bankUI(username,
`✨ 𝗜𝗡𝗧𝗘𝗥𝗘𝗦𝗧 𝗘𝗔𝗥𝗡𝗘𝗗
━━━━━━━━━━━━━━
💹 $${format(interest)}`)
      );
    }

    /* ================= TRANSFER ================= */
    else if (cmd === "transfer") {
      if (!amount || !target)
        return message.reply(bankUI(username, "❌ Usage: bank transfer <amount> <uid>"));

      if (!bankData[target])
        return message.reply(bankUI(username, "❌ Receiver not found"));

      if (bankData[uid].bank < amount)
        return message.reply(bankUI(username, "❌ Not enough bank balance"));

      bankData[uid].bank -= amount;
      bankData[target].bank += amount;
    }

    /* ================= RICHEST ================= */
    else if (cmd === "richest") {
      const top = Object.entries(bankData)
        .sort((a, b) => b[1].bank - a[1].bank)
        .slice(0, 10);

      let list = "";
      for (let i = 0; i < top.length; i++) {
        const name = await usersData.getName(top[i][0]);
        list += `\n${i + 1}. ${name} — $${format(top[i][1].bank)}`;
      }

      return message.reply(
`╭───〔 👑 ${BANK_NAME} RICHEST 〕───╮${list}
╰────────────────────────╯`
      );
    }

    /* ================= LOAN ================= */
    else if (cmd === "loan") {
      if (!amount || amount <= 0)
        return message.reply(bankUI(username, "❌ Invalid loan amount"));

      if (!bankData[uid].loanPayed)
        return message.reply(bankUI(username, `❌ Pay previous loan: $${format(bankData[uid].loan)}`));

      bankData[uid].loan = amount;
      bankData[uid].loanPayed = false;
      bankData[uid].bank += amount;
    }

    /* ================= PAY LOAN ================= */
    else if (cmd === "payloan") {
      if (!amount || amount <= 0)
        return message.reply(bankUI(username, "❌ Invalid amount"));

      if (bankData[uid].loan <= 0)
        return message.reply(bankUI(username, "✅ No loan left"));

      if (userMoney < amount)
        return message.reply(bankUI(username, "❌ Not enough wallet balance"));

      bankData[uid].loan -= amount;
      await usersData.set(uid, { money: userMoney - amount });

      if (bankData[uid].loan === 0)
        bankData[uid].loanPayed = true;
    }

    else {
      return message.reply(
        bankUI(username,
`📌 Commands:
• deposit
• withdraw
• balance
• interest
• transfer
• richest
• loan
• payloan`)
      );
    }

    fs.writeFileSync(DATA_PATH, JSON.stringify(bankData, null, 2));
    return message.reply(bankUI(username, "✅ Transaction Successful"));
  }
};

function format(num) {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return num.toFixed(2);
     }
