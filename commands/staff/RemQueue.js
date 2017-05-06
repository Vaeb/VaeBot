module.exports = Cmds.addCommand({
	cmds: [";remqueue ", ";remq "],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Remove a song from the music queue",

	args: "[song_name]",

	example: "gonna give you up",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		args = args.toLowerCase();
		var realSongs = Music.songs[guild.id];
		for (var i = realSongs.length-1; i >= 0; i--) {
			var newSong = realSongs[i];
			var video = newSong[0];
			var author = newSong[1];
			var title = video.snippet.title;
			if (title.toLowerCase().indexOf(args) >= 0) {
				Util.print(channel, "Removed", title, "from the queue");
				var connection = guild.voiceConnection;
				realSongs.splice(i, 1);
				if (connection != null && Music.songData[guild.id].nowVideo != null && title == Music.songData[guild.id].nowVideo.snippet.title) Music.playNextQueue(guild, channel, true);
			}
		}
	}
});
