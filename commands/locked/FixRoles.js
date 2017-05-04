module.exports = Cmds.addCommand({
	cmds: [";fix roles"],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Fix new role permissions",

	args: "",

	example: "",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		var defRole = Util.getRole("@everyone", guild);
		var sendRole = Util.getRole("SendMessages", guild);
		var guildRoles = guild.roles;
		var defNew = {};
		var sendNew = {};

		var newRolePerms = ["CHANGE_NICKNAME", "EMBED_LINKS", "SEND_MESSAGES", "READ_MESSAGES", "READ_MESSAGE_HISTORY", "ADD_REACTIONS", "USE_EXTERNAL_EMOJIS", "CONNECT", "SPEAK", "USE_VAD"];

		sendRole.setPermissions(newRolePerms)
		.catch(error => console.log("\n[E_FixRoles1] " + error));

		guildRoles.forEach(role => {
			if (role.id == sendRole.id) return;
			role.setPermissions([])
			.catch(error => console.log("\n[E_FixRoles2] " + error));
		});

		/*var textChannels = Util.getTextChannels(guild);
		for (var i = 0; i < textChannels.length; i++) {
			var channel = textChannels[i];
			Util.setChannelPerms(channel, defRole, defNew);
			Util.setChannelPerms(channel, sendRole, sendNew);
		}*/
	}
});