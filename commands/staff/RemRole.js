module.exports = Cmds.addCommand({
	cmds: [";remrole ", ";removerole ", ";delrole "],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Remove a role from a user",

	args: "([@user] | [id] | [name]) ([role_name])",

	example: "vae mod",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		var data = Util.getDataFromString(args, [
			function(str, results) {
				return Util.getMemberByMixed(str, guild);
			},
			function(str, results) {
				return Util.getRole(str, guild);
			},
		], false);

		if (!data) return Util.commandFailed(channel, speaker, "Invalid parameters");

		var user = data[0];
		var role = data[1];

		if (speaker != user && Util.getPosition(speaker) <= Util.getPosition(user)) {
			Util.commandFailed(channel, speaker, "User has equal or higher rank");
			return;
		}

		if (Util.getPosition(speaker) <= role.position) {
			Util.commandFailed(channel, speaker, "Role has equal or higher rank");
			return;
		}
		user.removeRole(role);

		var sendEmbedFields = [
			{name: "Username", value: Util.getMention(user)},
			{name: "Role Name", value: role.name}
		];
		Util.sendEmbed(
			channel, // Channel Object
			"Removed Role", // Title String
			null, // Description String
			Util.makeEmbedFooter(speaker), // Username + ID String
			Util.getAvatar(user), // Avatar URL String
			0x00E676, // Color Number
			sendEmbedFields
		);
	}
});