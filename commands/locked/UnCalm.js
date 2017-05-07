module.exports = Cmds.addCommand({
	cmds: [";uncalm", ";uncalmchat", ";unslow", ";unslowchat"],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Removes chat slowdown",

	args: "",

	example: "",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		if (!index.slowChat[guild.id]) return;
		
		index.slowChat[guild.id] = null;
		index.chatQueue[guild.id] = null;
		clearInterval(index.slowInterval[guild.id]);
		index.slowInterval[guild.id] = null;
	}
});
