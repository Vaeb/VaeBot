module.exports = Cmds.addCommand({
	cmds: [";voteskip"],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Vote to skip the current song (will skip when the vote reaches 50% of the users in the voice channel)",

	args: "",

	example: "",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		var connection = guild.voiceConnection;
		if (connection) {
			var allChannels = guild.channels;
			var voiceChannel = allChannels.find(c => {
				if (!c.type == "voice") return false;
				var hasMember = c.members.find(o => o.id == selfId);
				if (hasMember != null) return true;
				return false;
			});
			var voiceMembers = voiceChannel.members;
			var numMembers = voiceMembers.size-1;
			if (!voiceMembers.find(o => o.id == speaker.id)) {
				Util.print(channel, "You are not in the voice channel");
				return;
			}
			var alreadyExists = false;
			var guildMusicInfo = Music.guildMusicInfo[guild.id];
			var voteSkips = guildMusicInfo.voteSkips;
			for (var i = 0; i < voteSkips.length; i++) {
				if (voteSkips[i] == speaker.id) {
					alreadyExists = true;
					break;
				}
			}
			if (alreadyExists == true) {
				Util.print(channel, "You can't vote more than once!");
				return;
			}
			voteSkips.push(speaker.id);
			var numVotes = voteSkips.length;
			var voteStr = numVotes == 1 ? "vote" : "votes";
			Util.print(channel, "Vote skip:", numVotes, voteStr);
			console.log("Vote skip: " + numVotes/numMembers);
			if (numVotes/numMembers >= 0.5) {
				var realSongs = Music.guildQueue[guild.id];
				var autoPlaylist = Data.guildGet(guild, Data.playlist);
				var firstInQueue = realSongs[0];
				if (guildMusicInfo.isAuto == false && realSongs.length > 0 && guildMusicInfo.activeSong != null && guildMusicInfo.activeSong.title == firstInQueue[0].title) realSongs.splice(0, 1);
				Music.playNextQueue(guild, channel, true);
			}
		}
	}
});