module.exports = Cmds.addCommand({
	cmds: [";stop", ";silence"],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Cancel the party, the bangin' tunes can wait for another day",

	args: "([song_name])",

	example: "kanye",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		var realSongs = Music.songs[guild.id];
		var realSongData = Music.songData[guild.id];
		var connection = guild.voiceConnection;
		if (connection) {
			if (Music.isPlaying[guild.id]) {
				if (realSongData.isAuto == false) realSongs.splice(0, 1);
				Music.stopMusic(guild);
				Util.print(channel, "Stopping audio");
			} else {
				Util.print(channel, "No audio playing");
			}
		} else {
			Util.print(channel, "No audio found");
		}
	}
});