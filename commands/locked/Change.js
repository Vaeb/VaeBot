module.exports = Cmds.addCommand({
	cmds: [";change "],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Change an existing something",

	args: "([channelId]) ([memberOrRoleId]) ([permEnable1]) ([permEnable2]) ([permEnable3])",

	example: "123456789 987654321 SEND_MESSAGES READ_MESSAGES",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		var data = Util.getDataFromString(args, [
			function(str, results) {
				return Util.findChannel(str, guild);
			},
			function(str, results) {
				return Util.getMemberOrRoleByMixed(str, guild);
			},
			function(str, results) {
				return str;
			}
		], false);
		if (!data) return Util.commandFailed(channel, speaker, "Invalid parameters");

		var newChannel = data[0];
		var userOrRole = data[1];
		var permStr = data[2];

		var permSplit = permStr.split(" ");
		var permObj = {};

		for (var i = 0; i < permSplit.length; i++) {
			var keySplit = permSplit[i].split(":");
			if (keySplit.length == 2) {
				var keyUpper = keySplit[0].toUpperCase();
				var valLower = keySplit[1].toLowerCase();
				if (valLower == "true") {
					console.log("Changing " + keyUpper + " to " + valLower);
					permObj[keyUpper] = true;
				} else if (valLower == "false") {
					console.log("Changing " + keyUpper + " to " + valLower);
					permObj[keyUpper] = false;
				}
			}
		}

		Util.setChannelPerms(newChannel, userOrRole, permObj);
	}
});
