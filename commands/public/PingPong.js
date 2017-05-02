module.exports = {
	cmds: ["ping"],

	desc: "pong",

	args: "",
	example: "ping",

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		if (Util.isQuiet(channel, speaker)) return;

		Util.sendDescEmbed(channel, null, "pong", null, null, null);
	}
};