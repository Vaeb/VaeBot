module.exports = Cmds.addCommand({
	cmds: [";play ", ";add ", ";addqueue "],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Make VaeBot play some bangin' tunes (or add them to the queue if the party's already started)",

	args: "([song_name] | [youtube_id] | [youtube_url])",

	example: "never gonna give you up",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		var realSongs = Music.songs[guild.id];

		if (Music.noPlay.hasOwnProperty(speaker.id)) return;

		Music.joinMusic(guild, channel, connection => {
			if (args.includes("http")) {
				var videoId = /[^/=]+$/.exec(args);
				if (videoId != null && videoId[0]) {
					videoId = videoId[0];
					index.YtInfo.getById(videoId, function(error, result) {
						var video = result.items[0];
						if (video != null) {
							Music.addSong(speaker, guild, channel, video);
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
							var video = items[i];
							if (video != null && video.hasOwnProperty("id") && video.id.kind == "youtube#video") {
								hasFound = true;
								Music.addSong(speaker, guild, channel, video);
								break;
							}
						}
						if (!hasFound) {
							Util.print(channel, "Audio not found");
						}
					}
				});
			}
		});
	}
});