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
				if (lower == "all" || lower == "bot" || lower == "hook" || lower == "image" || lower == "file" || lower == "link" || lower == "mention") {
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

		fetchMessagesEx(channel, numSearch, msgStore).then(() => {
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
				}
			}
		});
	}
});