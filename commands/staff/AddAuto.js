module.exports = Cmds.addCommand({
	cmds: [";addauto ", ";adda ", ";addtoauto "],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Adds a song to the music auto-playlist",

	args: "[song_name]",

	example: "gonna give you up",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		if (args.includes("http")) {
			var songId = /[^/=]+$/.exec(args);
			if (songId != null && songId[0]) {
				songId = songId[0];
				index.YtInfo.getById(songId, function(error, result) {
					var songData = result.items[0];
					if (songData != null) {
						var autoPlaylist = Data.guildGet(guild, Data.playlist, "songs");
						if (autoPlaylist == null) {
							autoPlaylist = [];
							Data.guildSet(guild, Data.playlist, "songNum", 0);
							Data.guildSet(guild, Data.playlist, "songs", autoPlaylist);
						}
						autoPlaylist.push([songData, speaker]);
						Data.guildSaveData(Data.playlist);
						Util.sendDescEmbed(channel, "[" + autoPlaylist.length + "] Auto-Playlist Appended", songData.snippet.title, Util.makeEmbedFooter(speaker), null, 0x00E676);
					} else {
						Util.print(channel, "Audio not found");
					}
				});
			} else {
				Util.print(channel, "Incorrect format for URL");
			}
		} else {
			index.YtInfo.search(args, 6, function(error, result) {
				if (error) {
					Util.print(channel, error);
				} else {
					var items = result.items;
					var hasFound = false;
					for (var i = 0; i < items.length; i++) {
						var songData = items[i];
						if (songData != null && songData.hasOwnProperty("id") && songData.id.kind == "youtube#video") {
							hasFound = true;
							var autoPlaylist = Data.guildGet(guild, Data.playlist, "songs");
							if (autoPlaylist == null) {
								autoPlaylist = [];
								Data.guildSet(guild, Data.playlist, "songNum", 0);
								Data.guildSet(guild, Data.playlist, "songs", autoPlaylist);
							}
							autoPlaylist.push([songData, speaker]);
							Data.guildSaveData(Data.playlist);
							Util.sendDescEmbed(channel, "[" + autoPlaylist.length + "] Auto-Playlist Appended", songData.snippet.title, Util.makeEmbedFooter(speaker), null, 0x00E676);
							break;
						}
					}
					if (!hasFound) {
						Util.print(channel, "Audio not found");
					}
				}
			});
		}
		//Data.guildSet(guild, playlist, args);
	}
});