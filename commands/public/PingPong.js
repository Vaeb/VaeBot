module.exports = Cmds.addCommand({
	cmds: ["ping"],

	requires: {
		guild: false,
		loud: true
	},

	desc: "pong",

	args: "",

	example: "",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		Util.sendDescEmbed(channel, null, "pong", null, null, null);
	}
});