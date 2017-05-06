module.exports = Cmds.addCommand({
	cmds: [";channels"],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Get all guild channels",

	args: "",

	example: "",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		var outStr = [];
		outStr.push("**Guild text channels:**\n```");
		Util.getTextChannels(guild).forEach(function(value, index, self) {
			outStr.push("Channel: " + value.name + " (" + value.id + ") | Topic: " + value.topic + " | Position: " + value.position + " | Created: " + value.createdAt);
		});
		outStr.push("```");
		outStr.push("**Guild voice channels:**\n```");
		Util.getVoiceChannels(guild).forEach(function(value, index, self) {
			outStr.push("Channel: " + value.name + " (" + value.id + ") | Topic: " + value.topic + " | Position: " + value.position + " | Created: " + value.createdAt + " | Bitrate: " + value.bitrate);
		});
		Util.print(channel, outStr.join("\n"));
	}
});