// active war storage
const activeWar = new Map();

module.exports = {
  config: {
    name: "xudi",
    aliases: ["chud"],
    version: "1.0",
    author: "nexo_here",
    role: 2,
    category: "admin",
    guide: {
      vi: "Not Available",
      en: "chud @(mention) | off"
    } 
  },

  onStart: async function ({ api, event, userData, args }) {

    // 🔴 OFF SYSTEM
    if (args[0] && args[0].toLowerCase() === "off") {
      if (activeWar.has(event.threadID)) {
        activeWar.set(event.threadID, false);
        return api.sendMessage("❌ xudi OFF", event.threadID);
      } else {
        return api.sendMessage("⚠️ WAR is not running", event.threadID);
      }
    }

    var mention = Object.keys(event.mentions)[0];
    if (!mention)
      return api.sendMessage(
        "Need to tag 1 friend whome you want to scold with bad words",
        event.threadID
      );

    let name = event.mentions[mention];
    var arraytag = [];
    arraytag.push({ id: mention, tag: name });

    // 🟢 ON
    activeWar.set(event.threadID, true);

    var a = function (msg) {
      if (!activeWar.get(event.threadID)) return;
      api.sendMessage(msg, event.threadID);
    };

    setTimeout(() => { a({ body: "কিরে মাদারচোত আশিকের এর চুদন খাওয়ায় জন্য রেডি তো?" + "লে চুদা খা মাঙ্গের বেটা 😂😂" + name, mentions: arraytag }) }, 3000);
    setTimeout(() => { a({ body: "মাঘি চুদা শরের বাচ্চা কার লগে পঙ্গা নিতে আসছিস 🤬🤬🤬 " + name, mentions: arraytag }) }, 5000);
    setTimeout(() => { a({ body: " চুদে গুহা ফাঁক করে দিব খানকীর পোলা 🤤 " + name, mentions: arraytag }) }, 7000);
    setTimeout(() => { a({ body: " মাদারচোত বোকাচোদা খানকীর পোলা " + name, mentions: arraytag }) }, 9000);
    setTimeout(() => { a({ body: " বেসসা মাঘী চোদা কুত্তা চোদা " + name, mentions: arraytag }) }, 12000);
    setTimeout(() => { a({ body: " ছাগল চুদা গরু চুদা মাঙ্গের বেটা লোকজন দেখে লাগতে আসিস কুত্তার বাচ্চা 🤬 " + name, mentions: arraytag }) }, 14000);
    setTimeout(() => { a({ body: " তোর আব্বুকে ভুলে গেলি মাদারচোত 😂 " + name, mentions: arraytag }) }, 16000);
    setTimeout(() => { a({ body: " তোকে কনডম ছাড়া চুদী মঙ্গের বেটা 🖕🏿 " + name, mentions: arraytag }) }, 18000);
    setTimeout(() => { a({ body: " আমার ধন চুষ তাইলে থামবো 😂 " + name, mentions: arraytag }) }, 20000);
    setTimeout(() => { a({ body: " তোরে কুত্তা দিয়ে চোদাই 😍 " + name, mentions: arraytag }) }, 22000);
    setTimeout(() => { a({ body: " এখনো সময় আছে মাফ চা 🤣🤣 " + name, mentions: arraytag }) }, 26000);
    setTimeout(() => { a({ body: " তোর নানি কেমন আছে 😍?? " + name, mentions: arraytag }) }, 28000);
    setTimeout(() => { a({ body: " তোকে চুদী 🥰 " + name, mentions: arraytag }) }, 30000);
    setTimeout(() => { a({ body: " মাদারচোত 🥰 " + name, mentions: arraytag }) }, 32000);
    setTimeout(() => { a({ body: " আজকের চুদন আজীবন মনে রাখিস বোকাচোদা 🤣🤣🤣 " + name, mentions: arraytag }) }, 34000);
    setTimeout(() => { a({ body: " মাঘা 🥰 " + name, mentions: arraytag }) }, 36000);
    setTimeout(() => { a({ body: " আয় আমার ধোন টা চুষে দে 🥵🥵 " + name, mentions: arraytag }) }, 38000);
    setTimeout(() => { a({ body: " বাপ কে ভুলিস না বোকাচোদার বাচ্চা 🤬🤬🤬🤬🤬 " + name, mentions: arraytag }) }, 40000);
    setTimeout(() => { a({ body: " হোল কাটে নিবো 🤬🤬🤬🤬🤬🤬 " + name, mentions: arraytag }) }, 44000);
    setTimeout(() => { a({ body: " 🖕🏿🖕🏿🖕🏿🖕🏿🖕🏿 " + name, mentions: arraytag }) }, 48000);
    setTimeout(() => { a({ body: " মাঘীর ছেলে তোর মাকে চুদী 🖕🏽🖕🏽🖕🏽 " + name, mentions: arraytag }) }, 50000);
  }
};