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

		for (let actionName in exports.Actions) {
			if (!exports.Actions.hasOwnProperty(actionName)) continue;

			sendEmbedFields.push({name: actionName, value: "​", inline: false});
		}

		Util.sendEmbed(channel, "Actions", "All actions which can be used in ;link\n​", Util.makeEmbedFooter(speaker), null, 0x00E676, sendEmbedFields);
	}
});