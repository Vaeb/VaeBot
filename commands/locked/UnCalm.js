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
		index.slowChat = false;
		clearInterval(index.slowInterval);
		index.slowInterval = null;
	}
});
