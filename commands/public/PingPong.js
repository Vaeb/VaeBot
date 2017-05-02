Cmds.addCommand({
	cmds: ["ping"],

	perms: {
		vaebs: false,
		staff: false,
		guild: false
	},

	desc: "pong",

	syntax: "",

	example: "ping",

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		if (Util.isQuiet(channel, speaker)) return;

		Util.sendDescEmbed(channel, null, "pong", null, null, null);
	}
});