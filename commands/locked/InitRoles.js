module.exports = Cmds.addCommand({
	cmds: [";init roles"],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Assign all SendMessages roles",

	args: "",

	example: "",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		var sendRole = Util.getRole("SendMessages", guild);

		if (sendRole != null) {
			Util.initRoles(sendRole, guild);
		} else {
			var newRolePerms = ["CHANGE_NICKNAME", "EMBED_LINKS", "SEND_MESSAGES", "READ_MESSAGES", "READ_MESSAGE_HISTORY", "ADD_REACTIONS", "USE_EXTERNAL_EMOJIS", "CONNECT", "SPEAK", "USE_VAD"];
			guild.createRole({
				name: "SendMessages",
				hoist: false,
				permissions: newRolePerms,
				position: 1
			})
			.then(role => { 
				Util.initRoles(role, guild);
			})
			.catch(error => console.log("\n[E_InitRolesCreate] " + error));
		}
	}
});