module.exports = Cmds.addCommand({
	cmds: [";disabr "],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Change even more existing somethings",

	args: "([guildId]) ([roleName]) ([permEnable1]) ([permEnable2]) ([permEnable3])",

	example: "123456789 Vaeben SEND_MESSAGES READ_MESSAGES",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		var data = Util.getDataFromString(args, [
			function(str, results) {
				return client.guilds.get(str);
			},
			function(str, results) {
				return Util.getRole(str, results[0]);
			},
		], true);
		if (!data) return Util.commandFailed(channel, speaker, "Invalid parameters");
		var newGuild = data[0];
		var newRole = data[1];
		var newPerms = data[2];

		var setPerms = [];
		var pattern = /[\w_]+/g;

		var matchData;
		var allMatches = {};

		while (matchData = pattern.exec(newPerms)) {
			var permName = matchData[0];
			if (Util.rolePermissionsObj[permName]) {
				console.log("Disabled " + permName + " permission for " + newRole.name + " role");
				allMatches[permName] = true;
			}
		}

		for (var i = 0; i < Util.rolePermissions.length; i++) {
			var permName = Util.rolePermissions[i];
			if (newRole.hasPermission(permName) && !allMatches.hasOwnProperty(permName)) {
				setPerms.push(permName);
			}
		}

		newRole.setPermissions(setPerms)
		.catch(error => console.log("\n[E_DisabR] " + error));
	}
});