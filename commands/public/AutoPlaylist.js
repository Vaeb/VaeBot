module.exports = Cmds.addCommand({
	cmds: [";autoplaylist", ";ap"],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Output all the bangin' tunes in the auto-playlist",

	args: "",

	example: "",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		var autoPlaylist = Data.guildGet(guild, Data.playlist);
		var autoSongs = autoPlaylist.songs;

		var sendEmbedFields = [];

		for (var i = 0; i < autoSongs.length; i++) {
			var video = autoSongs[i][0];
			var author = autoSongs[i][1];
			sendEmbedFields.push({name: "[" + (i+1) + "] " + video.snippet.title, value: "​", inline: false});
		}

		Util.sendEmbed(channel, "Auto-Playlist", null, Util.makeEmbedFooter(speaker), null, 0x00E676, sendEmbedFields);
	}
});