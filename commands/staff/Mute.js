module.exports = Cmds.addCommand({
	cmds: [";mute ", ";warn ", ";mutehammer "],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Mute a user (in all guild channels) and add the mute to their record",

	args: "([@user] | [id] | [name]) ([reason])",

	example: "vaeb being weird",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		Mutes.doMute(args, guild, Util.getPosition(speaker), channel, speaker);
	}
});