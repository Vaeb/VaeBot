module.exports = Cmds.addCommand({
	cmds: [";enabr ", ";setr "],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Change more existing somethings",

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

		var rolePerms = newRole.serialize();

		var setPerms = [];

		var pattern = /[\w_]+/g;

		for (let permName in rolePerms) {
			if (!rolePerms.hasOwnProperty(permName)) continue;
			if (rolePerms[permName]) {
				setPerms.push(permName);
			}
		}

		var matchData;
		while (matchData = pattern.exec(newPerms)) {
			let permName = matchData[0];
			if (Util.rolePermissionsObj[permName] && !newRole.hasPermission(permName)) {
				setPerms.push(permName);
				console.log("Enabled " + permName + " permission for " + newRole.name + " role");
			}
		}

		console.log(setPerms);

		newRole.setPermissions(setPerms)
		.catch(console.error);
	}
});