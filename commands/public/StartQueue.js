module.exports = Cmds.addCommand({
	cmds: [";startqueue"],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Start playing the queued music",

	args: "",

	example: "",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		Music.joinMusic(guild, channel, connection => {
			var realSongs = Music.songs[guild.id];
			if (realSongs.length > 0) {
				Music.playNextQueue(guild, channel, true);
			} else {
				Util.print(channel, "No songs in queue");
			}
		});
	}
});