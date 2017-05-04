module.exports = Cmds.addCommand({
	cmds: [";commit ", ";editr "],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Commit some changes",

	args: "([roleName]) ([newName]) ([newColor]) ([newHoist]) ([newMentionable]) ([newPosition])",

	example: "Vaeben Gaeben 0xFF0000 null null 3",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		var data = Util.getDataFromString(args, [
			function(str, results) {
				return Util.getRole(str, guild);
			},
			function(str, results) {
				return str;
			},
			function(str, results) {
				if (str == "null") return str;
				return Util.getNum(str);
			},
			function(str, results) {
				if (str == "null") return str;
				return Util.toBoolean(str);
			},
			function(str, results) {
				if (str == "null") return str;
				return Util.toBoolean(str);
			},
			function(str, results) {
				if (str == "null") return str;
				return Util.getNum(str);
			}
		], false);
		if (!data) return Util.commandFailed(channel, speaker, "Invalid parameters");

		for (var i = 1; i < data.length; i++) {
			data[i] = data[i] != "null" ? data[i] : null;
		}

		var role = data[0];
		var name = data[1];
		var color = data[2];
		var hoist = data[3];
		var mentionable = data[4];
		var pos = data[5];

		if (!role) {
			return Util.commandFailed(channel, speaker, "Invalid parameters");
		}

		if (name) {
			role.setName(name)
			.catch(error => console.log("\n[E_RoleComm1] " + error));
		}

		if (color) {
			role.setColor(color)
			.catch(error => console.log("\n[E_RoleComm2] " + error));
		}

		if (hoist) {
			role.setHoist(hoist)
			.catch(error => console.log("\n[E_RoleComm3] " + error));
		}

		if (mentionable) {
			role.setMentionable(mentionable)
			.catch(error => console.log("\n[E_RoleComm4] " + error));
		}

		if (pos) {
			role.setPosition(pos)
			.catch(error => console.log("\n[E_RoleComm5] " + error));
		}
	}
});