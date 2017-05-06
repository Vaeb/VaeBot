module.exports = Cmds.addCommand({
	cmds: [";queue"],

	requires: {
		guild: true,
		loud: false
	},

	desc: "List all queued songs",

	args: "",

	example: "",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		var realSongs = Music.songs[guild.id];

		var sendEmbedFields = [];

		for (var i = 0; i < realSongs.length; i++) {
			var video = realSongs[i][0];
			var author = realSongs[i][1];
			sendEmbedFields.push({name: "[" + (i+1) + "] " + video.snippet.title, value: "Added by " + Util.safeEveryone(author.toString()), inline: false});
		}

		Util.sendEmbed(channel, "Audio Queue", null, Util.makeEmbedFooter(speaker), null, 0x00E676, sendEmbedFields);
	}
});