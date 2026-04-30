module.exports = {
	config: {
		name: "badwords",
		aliases: ["badword"],
		version: "1.5",
		author: "NTKhang + Fixed by Ashik",
		countDown: 5,
		role: 1,
		description: {
			vi: "Bật/tắt/thêm/xóa cảnh báo vi phạm từ thô tục, nếu thành viên vi phạm sẽ bị cảnh báo, lần 2 sẽ kick khỏi box chat",
			en: "Turn on/off/add/remove bad words warning, if a member violates, he will be warned, the second time he will be kicked out of the chat box"
		},
		category: "box chat",
		guide: {
			vi: "   {pn} add <words>: thêm từ cấm (có thể thêm nhiều từ cách nhau bằng dấu phẩy \",\" hoặc dấu gạch đứng \"|\""
				+ "\n   {pn} delete <words>: xóa từ cấm (có thể xóa nhiều từ cách nhau bằng dấu phẩy \",\" hoặc dấu gạch đứng \"|\""
				+ "\n   {pn} list <hide | để trống>: xem danh sách từ cấm (thêm \"hide\" để ẩn từ cấm)"
				+ "\n   {pn} unwarn [<userID> | <@tag>]: xóa 1 lần cảnh báo của 1 thành viên"
				+ "\n   {pn} on: bật cảnh báo"
				+ "\n   {pn} off: tắt cảnh báo",
			en: "   {pn} add <words>: add banned words (you can add multiple words separated by commas \",\" or vertical bars \"|\")"
				+ "\n   {pn} delete <words>: delete banned words (you can delete multiple words separated by commas \",\" or vertical bars \"|\")"
				+ "\n   {pn} list <hide | leave blank>: view banned words (add \"hide\" to hide banned words)"
				+ "\n   {pn} unwarn [<userID> | <@tag>]: remove 1 warning of 1 member"
				+ "\n   {pn} on: turn on warning"
				+ "\n   {pn} off: turn off warning"
		}
	},

	langs: {
		vi: {
			onText: "bật",
			offText: "tắt",
			onlyAdmin: "⚠️ | Chỉ quản trị viên mới có thể thêm từ cấm vào danh sách",
			missingWords: "⚠️ | Bạn chưa nhập từ cần cấm",
			addedSuccess: "✅ | Đã thêm %1 từ cấm vào danh sách",
			alreadyExist: "❌ | %1 từ cấm đã tồn tại trong danh sách: %2",
			tooShort: "⚠️ | %1 từ cấm quá ngắn, không thể thêm: %2",
			onlyAdmin2: "⚠️ | Chỉ quản trị viên mới có thể xóa từ cấm khỏi danh sách",
			missingWords2: "⚠️ | Bạn chưa nhập từ cần xóa",
			deletedSuccess: "✅ | Đã xóa %1 từ cấm khỏi danh sách",
			notExist: "❌ | %1 từ cấm không tồn tại trong danh sách: %2",
			emptyList: "⚠️ | Danh sách từ cấm hiện đang trống",
			badWordsList: "📑 | Danh sách từ cấm: %1",
			onlyAdmin3: "⚠️ | Chỉ quản trị viên mới có thể %1 tính năng này",
			turnedOnOrOff: "✅ | Cảnh báo từ cấm đã %1",
			onlyAdmin4: "⚠️ | Chỉ quản trị viên mới có thể xóa cảnh báo",
			missingTarget: "⚠️ | Bạn chưa nhập ID hoặc tag người dùng",
			notWarned: "⚠️ | Người dùng %1 chưa bị cảnh báo",
			removedWarn: "✅ | Đã xóa 1 lần cảnh báo của %1 | %2",
			warned: "⚠️ | Từ cấm \"%1\" đã được phát hiện, nếu tiếp tục sẽ bị kick.",
			warned2: "⚠️ | Từ cấm \"%1\" đã được phát hiện 2 lần, sẽ bị kick khỏi nhóm.",
			needAdmin: "Bot cần quyền quản trị viên để kick thành viên vi phạm",
			unwarned: "✅ | Đã xóa cảnh báo của người dùng %1 | %2"
		},
		en: {
			onText: "on",
			offText: "off",
			onlyAdmin: "⚠️ | Only admins can add banned words",
			missingWords: "⚠️ | You haven't entered banned words",
			addedSuccess: "✅ | Added %1 banned words",
			alreadyExist: "❌ | %1 banned words already exist: %2",
			tooShort: "⚠️ | %1 banned words too short, cannot add: %2",
			onlyAdmin2: "⚠️ | Only admins can delete banned words",
			missingWords2: "⚠️ | You haven't entered words to delete",
			deletedSuccess: "✅ | Deleted %1 banned words",
			notExist: "❌ | %1 banned words do not exist: %2",
			emptyList: "⚠️ | Banned words list is empty",
			badWordsList: "📑 | Banned words: %1",
			onlyAdmin3: "⚠️ | Only admins can %1 this feature",
			turnedOnOrOff: "✅ | Banned words warning has been %1",
			onlyAdmin4: "⚠️ | Only admins can remove warnings",
			missingTarget: "⚠️ | You haven't entered user ID or tag",
			notWarned: "⚠️ | User %1 has not been warned",
			removedWarn: "✅ | Removed 1 warning of %1 | %2",
			warned: "⚠️ | Banned word \"%1\" detected, continuing violation will get kicked.",
			warned2: "⚠️ | Banned word \"%1\" detected 2 times, user will be kicked.",
			needAdmin: "Bot needs admin rights to kick violating members",
			unwarned: "✅ | Removed banned word warning of %1 | %2"
		}
	},

	onStart: async function ({ message, event, args, threadsData, usersData, role, getLang }) {
		if (!args[0]) return message.reply("⚠️ | Vui lòng nhập lệnh: add, delete, list, on, off, unwarn");

		// Ensure badWords data exists
		let badWordsData = await threadsData.get(event.threadID, "data.badWords");
		if (!badWordsData) {
			badWordsData = { words: [], violationUsers: {} };
			await threadsData.set(event.threadID, badWordsData, "data.badWords");
		}
		const badWords = badWordsData.words;
		const violationUsers = badWordsData.violationUsers;

		switch (args[0].toLowerCase()) {
			case "add": {
				if (role < 1) return message.reply(getLang("onlyAdmin"));
				const words = args.slice(1).join(" ").split(/[,|]/).map(w => w.trim()).filter(w => w);
				if (!words.length) return message.reply(getLang("missingWords"));

				const success = [];
				const exist = [];
				const failed = [];

				for (const word of words) {
					if (word.length < 2) failed.push(word);
					else if (!badWords.includes(word)) success.push(word);
					else exist.push(word);
				}

				badWords.push(...success);
				await threadsData.set(event.threadID, { words: badWords, violationUsers }, "data.badWords");

				message.reply(
					(success.length ? getLang("addedSuccess", success.length) + "\n" : "") +
					(exist.length ? getLang("alreadyExist", exist.length, exist.join(", ")) + "\n" : "") +
					(failed.length ? getLang("tooShort", failed.length, failed.join(", ")) : "")
				);
				break;
			}

			case "delete":
			case "del":
			case "-d": {
				if (role < 1) return message.reply(getLang("onlyAdmin2"));
				const words = args.slice(1).join(" ").split(/[,|]/).map(w => w.trim()).filter(w => w);
				if (!words.length) return message.reply(getLang("missingWords2"));

				const success = [];
				const failed = [];

				for (const word of words) {
					const index = badWords.indexOf(word);
					if (index !== -1) { badWords.splice(index, 1); success.push(word); }
					else failed.push(word);
				}

				await threadsData.set(event.threadID, { words: badWords, violationUsers }, "data.badWords");

				message.reply(
					(success.length ? getLang("deletedSuccess", success.length) + "\n" : "") +
					(failed.length ? getLang("notExist", failed.length, failed.join(", ")) : "")
				);
				break;
			}

			case "list":
			case "all":
			case "-a": {
				if (!badWords.length) return message.reply(getLang("emptyList"));
				const hide = args[1] === "hide";
				message.reply(getLang("badWordsList", hide ? badWords.map(w => hideWord(w)).join(", ") : badWords.join(", ")));
				break;
			}

			case "on": {
				if (role < 1) return message.reply(getLang("onlyAdmin3", getLang("onText")));
				await threadsData.set(event.threadID, true, "settings.badWords");
				message.reply(getLang("turnedOnOrOff", getLang("onText")));
				break;
			}

			case "off": {
				if (role < 1) return message.reply(getLang("onlyAdmin3", getLang("offText")));
				await threadsData.set(event.threadID, false, "settings.badWords");
				message.reply(getLang("turnedOnOrOff", getLang("offText")));
				break;
			}

			case "unwarn": {
				if (role < 1) return message.reply(getLang("onlyAdmin4"));
				let userID = Object.keys(event.mentions)[0] || args[1] || (event.messageReply && event.messageReply.senderID);
				if (!userID || isNaN(userID)) return message.reply(getLang("missingTarget"));
				if (!violationUsers[userID]) return message.reply(getLang("notWarned", userID));

				violationUsers[userID] = Math.max(0, violationUsers[userID] - 1);
				await threadsData.set(event.threadID, { words: badWords, violationUsers }, "data.badWords");

				const userName = await usersData.getName(userID);
				message.reply(getLang("unwarned", userID, userName));
				break;
			}

			default:
				message.reply("⚠️ | Lệnh không hợp lệ: add, delete, list, on, off, unwarn");
		}
	},

	onChat: async function ({ message, event, api, threadsData, prefix, getLang }) {
		if (!event.body) return;

		const threadData = await threadsData.get(event.threadID);
		if (!threadData || !threadData.settings?.badWords) return;

		const isCommand = (global.GoatBot.commands.get("badwords").config.aliases || [])
			.concat(threadData.data.aliases?.["badwords"] || [])
			.some(a => event.body.startsWith(prefix + a));
		if (isCommand) return;

		const badWords = threadData.data.badWords?.words || [];
		const violationUsers = threadData.data.badWords?.violationUsers || {};

		for (const word of badWords) {
			if (event.body.match(new RegExp(`\\b${word}\\b`, "gi"))) {
				const userViolation = violationUsers[event.senderID] || 0;

				if (userViolation < 1) {
					message.reply(getLang("warned", word));
					violationUsers[event.senderID] = userViolation + 1;
					await threadsData.set(event.threadID, { words: badWords, violationUsers }, "data.badWords");
					return;
				} else {
					message.reply(getLang("warned2", word));
					api.removeUserFromGroup(event.senderID, event.threadID, err => {
						if (err) return message.reply(getLang("needAdmin"));
					});
					return;
				}
			}
		}
	}
};

function hideWord(str) {
	return str.length === 2 ? str[0] + "*" : str[0] + "*".repeat(str.length - 2) + str[str.length - 1];
}