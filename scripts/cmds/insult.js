module.exports = {
  config: {
    name: "insult",
    version: "5.5",
    author: "ChatGPT",
    category: "fun",
    guide: "{pn} @mention | {pn} off",
    role: { onStart: 1, onChat: 0 }
  },

  onLoad() {
    global.GoatBot.onChat ??= [];
    if (!global.GoatBot.onChat.includes("insult")) {
      global.GoatBot.onChat.push("insult");
    }
    global.insultData ??= {};
    global.insultLastMessage ??= {}; // duplicate prevent
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, mentions } = event;

    if (args[0] === "off") {
      delete global.insultData[threadID];
      delete global.insultLastMessage[threadID];
      return api.sendMessage("❌ Insult OFF Ashik boss চুদতে দিলো না ওরে। না হলে ওর পুরো ১৪ গুষ্ট চুদে নাই করে দিতাম...🥴🧨", threadID);
    }

    if (!Object.keys(mentions).length)
      return api.sendMessage("⚠️ একজনকে mention করো", threadID);

    const uid = Object.keys(mentions)[0];
    global.insultData[threadID] = uid;
    global.insultLastMessage[threadID] = ""; // reset last message

    api.sendMessage(`🔥 Insult ON ‎Ashik boss অনুমতি দিসে এখন তোকে আদর করবো।🐸....,🥒😈\nTarget: ${event.mentions[uid]}`, threadID);
  },

  onChat: async function ({ api, event, Users }) {
    const { threadID, senderID, body, messageID } = event;
    if (!body || !global.insultData) return;

    const targetID = global.insultData[threadID];
    if (senderID !== targetID) return; // শুধু target কে insult
    if (body.startsWith(global.GoatBot.config.prefix)) return;

    // Duplicate message prevention
    if (global.insultLastMessage[threadID] === body) return;
    global.insultLastMessage[threadID] = body;

    // gender handle
    let genderText = "হিজড়া";
    try {
      const userInfo = await Users.getData(senderID);
      if (userInfo && userInfo.gender === 1) genderText = "মাইয়া";
      else if (userInfo && userInfo.gender === 2) genderText = "পোলা";
    } catch (e) {}

    // insults
    const insults = [
      `খাংকির ${genderText}, তোর মার ভোদা ফাটাইয়া আমার মাল ফালাবো! 👹`,
      `তোর মার দুধ বের করে,আমি বাজারে বিক্রি করবো ৬০০টাকা লিটার ${genderText}! 😡`,
      `পাচঁটা শসা তোর মার পুটকি তে ভোরে দিয়ে তোর মা কে চুদতে চাই! 🔥`,
      `রসালো ভোদা তোর মার, আমি চেটে মাল আউট করে দিবো! 🥵💣`,
      `তোর মার গুদ মাত্র দেখে আসলাম কচি ভোদা , সেই ${genderText}! 😝`,
      `তোর বোন থাকলে ওর দুধ টিপে বড় করে দিবো তারপর আমি চুসবো, খানকিমাগীর বাচ্চা ${genderText}!`,
      `তোর মাকে doggy স্টাইলে চুদে দিবো তোর মা বলব "এতো বড় কে🥵?"`,
      `তোর মার পোদে Bluetooth Connect করবো, চুদিরপোলা ${genderText}!`,
      `তোর মার ভোদায় ৬টা ধন একসাথে ঢুকিয়ে ফাটিয়ে দিবো, আজকের রাতেই! 🥒🫦`,
      `এখন মাগীর ${genderText} তোর মার ভোদা চুদে, শাপ ঢুকাবো তোর মার ভোদায়! 😡`,
      `তোর মা কে চুদে প্রেগনেন্ট করে দিবো, তোর বাপ হবো ${genderText}! 🌚`,
    ];

    // reply mode: insult reply to user message
    api.sendMessage(
      insults[Math.floor(Math.random() * insults.length)],
      threadID,
      messageID // reply হিসেবে যাবে
    );
  }
};