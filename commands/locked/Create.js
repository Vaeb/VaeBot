module.exports = Cmds.addCommand({
	cmds: [";create ", ";make "],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Create something new",

	args: "([newColor]) ([newHoist]) ([newPosition]) ([newName])",

	example: "0xFF0000 false 3 Vaeben",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		var data = Util.getDataFromString(args, [
			function(str, results) {
				return Util.getNum(str);
			},
			function(str, results) {
				return Util.toBoolean(str);
			},
			function(str, results) {
				return Util.getNum(str);
			},
			function(str, results) {
				return str;
			}
		], false);
		if (!data) return Util.commandFailed(channel, speaker, "Invalid parameters");

		var color = data[0];
		var hoist = data[1];
		var pos = data[2];
		var name = data[3];

		console.log(pos);

		guild.createRole({
			name: name,
			color: color,
			hoist: hoist,
			mentionable: true,
			permissions: [],
			position: pos
		})
		.then(role => {
			role.setPosition(pos)
			.catch(console.error);
		})
		.catch(error => console.log("\n[E_CreateRole2] " + error));
	}
});