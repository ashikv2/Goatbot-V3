const { config } = global.GoatBot;

module.exports = {
config: {
name: "whitelist",
aliases: ["wl"],
version: "1.1",
author: "rehat-- | fixed by Mahabub",
countDown: 5,
role: 2,
longDescription: {
en: "Add, remove, edit whiteListIds"
},
category: "owner",
guide: {
en: '   {pn} [add | -a] <uid | @tag>: Add whitelist role for user'
+ '\n   {pn} [remove | -r] <uid | @tag>: Remove whitelist role of user'
+ '\n   {pn} [list | -l]: List all whitelist users'
+ '\n   {pn} [on | off]: Enable or disable whitelist mode'
}
},

langs: {
en: {
added: "✅ | Added whitelist role for %1 users:\n%2",
alreadyAdmin: "\n⚠ | %1 users already in whitelist:\n%2",
missingIdAdd: "⚠ | Please enter ID or tag user to add in whitelist",
removed: "✅ | Removed whitelist role of %1 users:\n%2",
notAdmin: "⚠ | %1 users are not in whitelist:\n%2",
missingIdRemove: "⚠ | Please enter ID or tag user to remove from whitelist",
listAdmin: "👑 | List of whitelist users:\n%1",
enable: "✅ Turned ON whitelist mode (only whitelisted users can use bot)",
disable: "❌ Turned OFF whitelist mode (everyone can use bot)"
}
},

onStart: async function ({ message, args, usersData, event, getLang, api }) {
const permission = global.GoatBot.config.owner;
if (!permission.includes(event.senderID)) {
return api.sendMessage("Ke tumi botsho 😷❄️?", event.threadID, event.messageID);
}

// ✅ Force initialization (main fix for your error)  
if (!config.whiteListMode || typeof config.whiteListMode !== "object") {  
  config.whiteListMode = { enable: false, whiteListIds: [] };  
}  
if (!Array.isArray(config.whiteListMode.whiteListIds)) {  
  config.whiteListMode.whiteListIds = [];  
}  

const { writeFileSync } = require("fs-extra");  

switch (args[0]) {  
  case "add":  
  case "-a": {  
    if (args[1]) {  
      let uids = [];  
      if (Object.keys(event.mentions).length > 0)  
        uids = Object.keys(event.mentions);  
      else if (event.messageReply)  
        uids.push(event.messageReply.senderID);  
      else  
        uids = args.filter(arg => !isNaN(arg));  

      const notAdminIds = [];  
      const adminIds = [];  

      for (const uid of uids) {  
        if (config.whiteListMode.whiteListIds.includes(uid))  
          adminIds.push(uid);  
        else  
          notAdminIds.push(uid);  
      }  

      config.whiteListMode.whiteListIds.push(...notAdminIds);  
      writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));  

      const getNames = await Promise.all(uids.map(uid =>  
        usersData.getName(uid).then(name => ({ uid, name }))  
      ));  

      return message.reply(  
        (notAdminIds.length > 0 ? getLang("added", notAdminIds.length, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")  
        + (adminIds.length > 0 ? getLang("alreadyAdmin", adminIds.length, adminIds.map(uid => `• ${uid}`).join("\n")) : "")  
      );  
    }  
    else return message.reply(getLang("missingIdAdd"));  
  }  

  case "remove":  
  case "-r": {  
    if (args[1]) {  
      let uids = [];  
      if (Object.keys(event.mentions).length > 0)  
        uids = Object.keys(event.mentions);  
      else  
        uids = args.filter(arg => !isNaN(arg));  

      const notAdminIds = [];  
      const adminIds = [];  

      for (const uid of uids) {  
        if (config.whiteListMode.whiteListIds.includes(uid))  
          adminIds.push(uid);  
        else  
          notAdminIds.push(uid);  
      }  

      for (const uid of adminIds)  
        config.whiteListMode.whiteListIds.splice(config.whiteListMode.whiteListIds.indexOf(uid), 1);  

      writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));  

      const getNames = await Promise.all(adminIds.map(uid =>  
        usersData.getName(uid).then(name => ({ uid, name }))  
      ));  

      return message.reply(  
        (adminIds.length > 0 ? getLang("removed", adminIds.length, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")  
        + (notAdminIds.length > 0 ? getLang("notAdmin", notAdminIds.length, notAdminIds.map(uid => `• ${uid}`).join("\n")) : "")  
      );  
    }  
    else return message.reply(getLang("missingIdRemove"));  
  }  

  case "list":  
  case "-l": {  
    if (config.whiteListMode.whiteListIds.length === 0)  
      return message.reply("⚠ | No users in whitelist yet.");  

    const getNames = await Promise.all(config.whiteListMode.whiteListIds.map(uid =>  
      usersData.getName(uid).then(name => ({ uid, name }))  
    ));  
    return message.reply(getLang("listAdmin", getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")));  
  }  

  case "on": {  
    config.whiteListMode.enable = true;  
    writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));  
    return message.reply(getLang("enable"));  
  }  

  case "off": {  
    config.whiteListMode.enable = false;  
    writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));  
    return message.reply(getLang("disable"));  
  }  

  default:  
    return message.SyntaxError();  
}

}
};


