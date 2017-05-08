const Ytdl = index.Ytdl;

exports.isPlaying = {};
exports.guildMusicInfo = {};
exports.guildQueue = {};
exports.noPlay = {};

exports.stopMusic = function(guild, reason) {
	var connection = guild.voiceConnection;
	if (!connection) return false;
	var voiceChannel = connection.channel;
	var player = connection.player;
	if (!player) return false;
	var dispatcher = player.dispatcher;
	if (!dispatcher) return false;
	exports.isPlaying[guild.id] = false;
	dispatcher.end(reason);
	var guildMusicInfo = exports.guildMusicInfo[guild.id];
	guildMusicInfo.activeSong = null;
	guildMusicInfo.activeAuthor = null;
	guildMusicInfo.voteSkips = [];
	guildMusicInfo.isAuto = false;
	return true;
};

exports.clearQueue = function(guild) {
	exports.guildQueue[guild.id] = [];
	return exports.stopMusic(guild);
};

exports.chooseRandomSong = function(guild, autoPlaylist, lastId) {
	var autoSongs = autoPlaylist.songs;
	var newSong = autoSongs[Util.getRandomInt(0, autoSongs.length-1)];
	var songData = exports.formatSong(newSong[0], false);
	var songInfo = [songData, newSong[1]];
	var songId = songData.id;
	if (autoSongs.length > 1 && songId == lastId) {
		return exports.chooseRandomSong(guild, autoPlaylist, lastId);
	} else {
		return songInfo;
	}
};

exports.playRealSong = function(newSong, guild, channel, doPrint) {
	console.log("Playing Real Song");
	if (doPrint == null) doPrint = true;
	var songData = newSong[0];
	var author = newSong[1];
	var guildMusicInfo = exports.guildMusicInfo[guild.id];
	guildMusicInfo.activeSong = songData;
	guildMusicInfo.activeAuthor = author;
	guildMusicInfo.voteSkips = [];
	guildMusicInfo.isAuto = false;
	exports.streamAudio(songData, guild, channel);
	if (doPrint) Util.sendDescEmbed(channel, "Playing " + songData.title, "Added by " + Util.safeEveryone(author.toString()), Util.makeEmbedFooter(author), null, 0x00E676);
};

exports.playNextQueue = function(guild, channel, doPrint) {
	console.log("\nCalled Playing Next Queue");
	if (doPrint == null) doPrint = true;
	var guildQueue = exports.guildQueue[guild.id];
	var autoPlaylist = Data.guildGet(guild, Data.playlist);
	console.log("guildQueue");
	console.log(guildQueue.length);
	console.log("-------Playing Next Queue---------\n");
	if (guildQueue.length > 0) {
		var newSong = guildQueue[0];
		exports.playRealSong(newSong, guild, channel, doPrint);
	} else if (autoPlaylist.hasOwnProperty("songs") && autoPlaylist.songs.length > 0) {
		console.log("Playing Next Queue, Playing Next Auto");
		exports.playNextAuto(guild, channel, true);
	} else {
		exports.stopMusic(guild);
	}
};

exports.playNextAuto = function(guild, channel, doPrint) {
	var autoPlaylist = Data.guildGet(guild, Data.playlist);
	if (!autoPlaylist.hasOwnProperty("songs") || autoPlaylist.songs.length === 0) {
		exports.stopMusic(guild);
		return;
	}
	var guildMusicInfo = exports.guildMusicInfo[guild.id];
	var lastId = "";
	if (guildMusicInfo.isAuto === true) lastId = guildMusicInfo.activeSong.id;
	var newSong = exports.chooseRandomSong(guild, autoPlaylist, lastId);
	var songData = newSong[0];
	var author = newSong[1];
	/*var newSongNum = songNum+1;
	if (newSongNum >= autoSongs.length) newSongNum = 0;
	autoPlaylist.songNum = newSongNum;
	Data.guildSaveData(Data.playlist);*/
	console.log("Playing Next Auto");
	guildMusicInfo.activeSong = songData;
	guildMusicInfo.activeAuthor = author;
	guildMusicInfo.voteSkips = [];
	guildMusicInfo.isAuto = true;
	exports.streamAudio(songData, guild, channel);
	if (doPrint) Util.sendDescEmbed(channel, "[Auto-Playlist-Started]", "Playing " + songData.title, Util.makeEmbedFooter(null), null, 0x00E676);
};

exports.streamAudio = function(songData, guild, channel) {
	var connection = guild.voiceConnection;
	if (connection == null) return Util.commandFailed(channel, "System", "Bot is not connected to a Voice Channel");

	var oldPlayer = connection.player;

	if (oldPlayer) {
		var oldDispatcher = oldPlayer.dispatcher;
		if (oldDispatcher) {
			console.log("Ended previous!");
			oldDispatcher.end("NewStreamAudio");
		}
	}

	var songId = songData.id;
	var isFile = songData.isFile;

	setTimeout(function() {
		connection = guild.voiceConnection;
		if (connection == null) return Util.commandFailed(channel, "System", "Bot is not connected to a Voice Channel");

		var voiceChannel = connection.channel;

		console.log("Streaming Audio: " + songId);
		
		const streamOptions = {seek: 0, volume: 0.2};
		var dispatcher;
		
		if (!isFile) {
			const stream = Ytdl(songId, {filter: 'audioonly'});
			dispatcher = connection.playStream(stream, streamOptions);
		} else {
			dispatcher = connection.playFile("/var/files/VaeBot/resources/music/" + songId + ".mp3");
		}

		exports.isPlaying[guild.id] = true;

		dispatcher.on("error", error => {
			console.log("StreamError: " + error);
		});

		dispatcher.on("end", reason => {
			console.log("Track Ended: " + reason);
			if (reason == "Stream is not generating quickly enough." || reason == "stream") {
				if (exports.isPlaying[guild.id]) {
					console.log("Track Ended, Starting Next: " + reason);
					var guildMusicInfo = exports.guildMusicInfo[guild.id];
					var guildQueue = exports.guildQueue[guild.id];

					if (guildQueue.length > 0) {
						var songData = guildQueue[0][0];
						var songId = songData.id;
						if (songId == songId) guildQueue.splice(0, 1);
					}

					if (voiceChannel.members.size > 1) {
						var autoPlaylist = Data.guildGet(guild, Data.playlist);
						if (guildQueue.length === 0 && guildMusicInfo.isAuto === true) {
							console.log("Track Ended, Playing Next Auto");
							exports.playNextAuto(guild, channel);
						} else {
							exports.playNextQueue(guild, channel, true);
						}
					} else {
						exports.stopMusic(guild);
						Util.print(channel, "Auto stopping audio | No users in voice");
					}
				}
			}
		});
	}, 1000);
};

exports.playFile = function(name, guild, channel) {
	var connection = guild.voiceConnection;
	if (connection == null) return Util.commandFailed(channel, "System", "Bot is not connected to a Voice Channel");
	var voiceChannel = connection.channel;

	var oldPlayer = connection.player;
	if (oldPlayer) {
		var oldDispatcher = oldPlayer.dispatcher;
		if (oldDispatcher) {
			console.log("Ended previous!");
			oldDispatcher.end("NewStreamAudio");
		}
	}

	console.log("Playing File: " + name);
	const streamOptions = {seek: 0, volume: 0.2};

	const dispatcher = connection.playFile("/var/files/VaeBot/resources/music/" + name + ".mp3");

	exports.isPlaying[guild.id] = true;

	dispatcher.on("error", error => {
		console.log(error);
	});

	dispatcher.on("end", reason => {
		console.log(reason);
	});
};

exports.joinMusic = function(guild, channel, func) {
	var connection = guild.voiceConnection;
	if (connection == null) {
		var musicChannel = Util.findVoiceChannel("music", guild);
		if (musicChannel) {
			musicChannel.join()
			.then(connection => {
				func(connection);
			})
			.catch(error => console.log("\n[E_JoinMusic] " + error));
		} else {
			Util.print(channel, "Not connected to a voice channel");
			return;
		}
	} else {
		func(connection);
	}
};

exports.formatSong = function(data, isFile) {
	if (isFile) {
		return {
			id: data,
			title: data,
			isFile: true
		};
	} else {
		return {
			id: typeof(data.id) == "object" ? data.id.videoId : data.id,
			title: data.snippet.title,
			isFile: false
		};
	}
};

exports.addSong = function(speaker, guild, channel, songData) {
	var guildQueue = exports.guildQueue[guild.id];
	guildQueue.push([songData, speaker]);
	if (guildQueue.length <= 1 || exports.guildMusicInfo[guild.id].isAuto === true) {
		exports.playNextQueue(guild, channel, true);
	} else {
		Util.sendDescEmbed(channel, "[" + guildQueue.length + "] Audio Queue Appended", songData.title, Util.makeEmbedFooter(speaker), null, 0x00E676);
	}
};
