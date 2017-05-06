module.exports = Cmds.addCommand({
	cmds: [";skip"],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Skip to the next song",

	args: "[song_name]",

	example: "gonna give you up",

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		var connection = guild.voiceConnection;
		if (connection) {
			var realSongs = Music.songs[guild.id];
			var autoPlaylist = Data.guildGet(guild, Data.playlist);
			var realSongData = Music.songData[guild.id];
			var firstInQueue = realSongs[0];
			console.log(realSongs.length);
			if (isStaff == true || (realSongData.isAuto == false && realSongData.nowAuthor.id == speaker.id)) {
				if (realSongData.isAuto == false && realSongs.length > 0 && realSongData.nowVideo != null && realSongData.nowVideo.snippet.title == firstInQueue[0].snippet.title) realSongs.splice(0, 1);
				console.log(realSongData.isAuto == false + " | " + realSongs.length + " | " + realSongData.nowVideo + " | " + ((realSongData.nowVideo && firstInQueue) ? realSongData.nowVideo.snippet.title == firstInQueue[0].snippet.title : "N/A") + " | " + (realSongData.nowVideo ? realSongData.nowVideo.snippet.title : "N/A") + " | " + (firstInQueue ? firstInQueue[0].snippet.title : "N/A"))
				Music.playNextQueue(guild, channel, true);
			} else {
				Util.print(channel, "You are not staff and you did not add this song");
			}
		}
	}
});