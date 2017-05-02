module.exports = {
	cmds: ["ping"],

	desc: "pong",

	args: "",
	example: "ping",

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		if (isQuiet(channel, speaker)) return;
		
		sendDescEmbed(channel, null, "pong", null, null, null);
	}
};