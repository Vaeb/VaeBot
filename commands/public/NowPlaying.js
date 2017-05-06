module.exports = Cmds.addCommand({
	cmds: [";nowplaying", ";np"],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Get info about the currently playing song",

	args: "",

	example: "",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		var realSongData = Music.songData[guild.id];
		if (realSongData.nowVideo != null) {
			Util.sendDescEmbed(channel, "Now Playing", realSongData.nowVideo.snippet.title, Util.makeEmbedFooter(speaker), null, 0x00E676);
		} else {
			Util.sendDescEmbed(channel, "Now Playing", "No songs are being played", Util.makeEmbedFooter(speaker), null, 0x00E676);
		}
	}
});