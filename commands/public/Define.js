module.exports = Cmds.addCommand({
	cmds: [";define ", ";urban "],

	requires: {
		guild: false,
		loud: false
	},

	desc: "Output the definition for a word/phrase using Urban Dictionary",

	args: "([keyword])",

	example: "yorkshire",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		var definitions = index.Urban(args);

		definitions.first(function(data) {
			if (data == null) {
				Util.commandFailed(channel, speaker, "No definition found");
				return;
			}

			var sendEmbedFields = [];

			var desc = Util.safeEveryone(data.definition);
			var example = Util.safeEveryone(data.example);

			if (desc.length > 2048) {
				desc = ("**[This message was shortened due to excessive length]** " + desc).substr(0, 2048);
			}

			if (example.length > 512) {
				example = ("**[This message was shortened due to excessive length]** " + example).substr(0, 512);
			}

			sendEmbedFields.push({name: "​", value: "​", inline: false});
			sendEmbedFields.push({name: "Example", value: example, inline: false});
			
			Util.sendEmbed(channel, Util.capitalize(data.word), desc, Util.makeEmbedFooter(speaker), null, 0x00E676, sendEmbedFields);
		});
	}
});