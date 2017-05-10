module.exports = Cmds.addCommand({
	cmds: [";events", ";guild events", ";all events"],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Output all events that can be used in ;link",

	args: "",

	example: "",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		var sendEmbedFields = [];

		sendEmbedFields.push({name: "MessageCreate", value: null, inline: false});
		sendEmbedFields.push({name: "MessageDelete", value: null, inline: false});
		sendEmbedFields.push({name: "UserJoin", value: null, inline: false});
		sendEmbedFields.push({name: "UserLeave", value: null, inline: false});
		sendEmbedFields.push({name: "UserMute", value: null, inline: false});
		sendEmbedFields.push({name: "UserUnMute", value: null, inline: false});
		sendEmbedFields.push({name: "UserUnMute", value: null, inline: false});
		sendEmbedFields.push({name: "UserRoleAdd", value: null, inline: false});
		sendEmbedFields.push({name: "UserRoleRemove", value: null, inline: false});
		sendEmbedFields.push({name: "UserNicknameUpdate", value: null, inline: false});

		Util.sendEmbed(channel, "Events", "All events which can be used in ;link", Util.makeEmbedFooter(speaker), null, 0x00E676, sendEmbedFields);
	}
});