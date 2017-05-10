module.exports = Cmds.addCommand({
	cmds: [";actions", ";guild actions", ";all actions"],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Output all actions that can be used in ;link",

	args: "",

	example: "",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		var sendEmbedFields = [];

		sendEmbedFields.push({name: "AddRole", value: null, inline: false});
		sendEmbedFields.push({name: "RemRole", value: null, inline: false});

		Util.sendEmbed(channel, "Actions", "All actions which can be used in ;link", Util.makeEmbedFooter(speaker), null, 0x00E676, sendEmbedFields);
	}
});