var checkFuncs = {
	user: (function checkUser(msgObj, userId) {
		return msgObj.author.id == userId;
	}),

	all: (function checkAll(msgObj) {
		return true;
	}),

	cmd: (function checkBot(msgObj) {
		return msgObj.author.id == selfId || Cmds.getCommand(msgObj.content) != null;
	}),

	bot: (function checkBot(msgObj) {
		return msgObj.author.bot == true;
	}),

	hook: (function checkHook(msgObj) {
		return msgObj.author.bot == true;
	}),

	image: (function checkImage(msgObj) {
		var embeds = msgObj.embeds != null ? msgObj.embeds : [];
		var attachments = msgObj.attachments != null ? msgObj.attachments : [];

		for (let i = 0; i < embeds.length; i++) {
			let nowEmbed = embeds[i];
			if (nowEmbed.type == "image" || nowEmbed.type == "gifv" || nowEmbed.type == "gif" || nowEmbed.type == "webm") {
				return true;
			}
		}

		for (let i = 0; i < attachments.length; i++) {
			let nowAtt = attachments[i];
			if (nowAtt.hasOwnProperty("width")) {
				return true;
			}
		}

		return false;
	}),

	file: (function checkFile(msgObj) {
		var attachments = msgObj.attachments != null ? msgObj.attachments : [];

		for (let i = 0; i < attachments.length; i++) {
			let nowAtt = attachments[i];
			if (!nowAtt.hasOwnProperty("width")) {
				return true;
			}
		}

		return false;
	}),

	link: (function checkLink(msgObj) {
		if (Util.checkURLs(msgObj.content).length > 0) return true;

		var embeds = msgObj.embeds != null ? msgObj.embeds : [];

		for (let i = 0; i < embeds.length; i++) {
			let nowEmbed = embeds[i];
			if (nowEmbed.type == "link") {
				return true;
			}
		}

		return false;
	}),

	mention: (function checkMentions(msgObj) {
		var mentions = msgObj.mentions;

		return mentions.length > 0;
	})
};

module.exports = Cmds.addCommand({
	cmds: [";clear ", ";clean ", ";wipe ", ";clearchats ", ";cleanchats "],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Delete the last <1-1000> messages from a [user | message-type] in the channel",

	args: "([@user] | [id] | [name] | [all | bots | hooks | images | files | links | mentions]) (<1-1000>)",

	example: "vaeb 30",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		var data = Util.getDataFromString(args, [
			function(str, results) {
				var lower = str.toLowerCase();
				if (lower.substring(lower.length-1) == "s") lower = lower.substr(0, lower.length-1);
				if (lower == "all" || lower == "cmd" || lower == "bot" || lower == "hook" || lower == "image" || lower == "file" || lower == "link" || lower == "mention") {
					return lower;
				} else {
					return Util.getMemberByMixed(str, guild);
				}
			},
			function(str, results) {
				var numArgs = Number(str);
				if (!isNaN(numArgs) && numArgs >= 1) {
					numArgs = Util.round(numArgs, 1);
					numArgs = Math.min(numArgs, 1000);
					return numArgs;
				}
			},
		], true);
		if (!data) {
			return Util.commandFailed(channel, speaker, "Invalid parameters");
		}

		var userOrType = data[0];
		var numArgs = data[1];
		var scope = data[2];
		var isUser = Util.isObject(userOrType);
		var userId = isUser ? userOrType.id : null;
		var msgStore = [];

		if (userOrType == "all" || userId == speaker.id) numArgs++;

		var checkFunc;

		if (isUser) {
			checkFunc = checkFuncs.user;
		} else {
			checkFunc = checkFuncs[userOrType];
		}

		var numSearch = userOrType != "all" ? numArgs*10 : numArgs;
		numSearch = Math.min(numSearch, 1000);

		var last = null;
		if (userOrType == "cmd") last = msgObj;

		Util.fetchMessagesEx(channel, numSearch, msgStore, last).then(() => {
			console.log("Messages checked: " + msgStore.length);

			var msgStoreUser = [];
			for (var i = 0; i < msgStore.length; i++) {
				if (checkFunc(msgStore[i], userId)) {
					msgStoreUser.push(msgStore[i]);
					if (msgStoreUser.length >= numArgs) break;
				}
			}

			var storeLength = msgStoreUser.length;
			var chunkLength = 99;
			console.log("Matches found: " + msgStoreUser.length);

			for (var i = 0; i < storeLength; i += chunkLength) {
				var chunk = msgStoreUser.slice(i, i + chunkLength);

				if (chunk.length > 1) {
					channel.bulkDelete(chunk)
					.then(() => console.log("Cleared " + chunk.length + " messages"))
					.catch(console.error);
				} else {
					chunk[0].delete();
					console.log("Cleared 1 message");
				}
			}
		});
	}
});