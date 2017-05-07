const Ytdl = index.Ytdl;

exports.isPlaying = {};
exports.songData = {};
exports.songs = {};
exports.noPlay = {};

exports.stopMusic = function(guild) {
	var connection = guild.voiceConnection;
	if (!connection) return false;
	var voiceChannel = connection.channel;
	var player = connection.player;
	if (!player) return false;
	var dispatcher = player.dispatcher;
	if (!dispatcher) return false;
	exports.isPlaying[guild.id] = false;
	dispatcher.end("StopMusic");
	var realSongData = exports.songData[guild.id];
	realSongData.nowVideo = null;
	realSongData.nowAuthor = null;
	realSongData.voteSkips = [];
	realSongData.isAuto = false;
	return true;
};

exports.clearQueue = function(guild) {
	exports.songs[guild.id] = [];
	return exports.stopMusic(guild);
};

exports.chooseRandomSong = function(guild, autoPlaylist, lastId) {
	var autoSongs = autoPlaylist.songs;
	var newSong = autoSongs[Util.getRandomInt(0, autoSongs.length-1)];
	var video = newSong[0];
	var songId = typeof(video.id) == "object" ? video.id.videoId : video.id;
	if (autoSongs.length > 1 && songId == lastId) {
		return exports.chooseRandomSong(guild, autoPlaylist, lastId);
	} else {
		return newSong;
	}
};

exports.playRealSong = function(newSong, guild, channel, doPrint) {
	console.log("Playing Real Song");
	if (doPrint == null) doPrint = true;
	var video = newSong[0];
	var author = newSong[1];
	var videoId = typeof(video.id) == "object" ? video.id.videoId : video.id;
	var realSongData = exports.songData[guild.id];
	realSongData.nowVideo = video;
	realSongData.nowAuthor = author;
	realSongData.voteSkips = [];
	realSongData.isAuto = false;
	exports.streamAudio(videoId, guild, channel);
	if (doPrint) Util.sendDescEmbed(channel, "Playing " + video.snippet.title, "Added by " + Util.safeEveryone(author.toString()), Util.makeEmbedFooter(author), null, 0x00E676);
};

exports.playNextQueue = function(guild, channel, doPrint) {
	console.log("Playing Next Queue");
	if (doPrint == null) doPrint = true;
	var realSongs = exports.songs[guild.id];
	var autoPlaylist = Data.guildGet(guild, Data.playlist);
	console.log("\nrealSongs");
	console.log(realSongs.length);
	console.log("-------Playing Next Queue---------");
	if (realSongs.length > 0) {
		var newSong = realSongs[0];
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
	var realSongData = exports.songData[guild.id];
	var lastId = "";
	if (realSongData.isAuto === true) lastId = typeof(realSongData.nowVideo.id) == "object" ? realSongData.nowVideo.id.videoId : realSongData.nowVideo.id;
	var newSong = exports.chooseRandomSong(guild, autoPlaylist, lastId);
	var video = newSong[0];
	var author = newSong[1];
	/*var newSongNum = songNum+1;
	if (newSongNum >= autoSongs.length) newSongNum = 0;
	autoPlaylist.songNum = newSongNum;
	Data.guildSaveData(Data.playlist);*/
	console.log("Playing Next Auto");
	var videoId = typeof(video.id) == "object" ? video.id.videoId : video.id;
	realSongData.nowVideo = video;
	realSongData.nowAuthor = author;
	realSongData.voteSkips = [];
	realSongData.isAuto = true;
	exports.streamAudio(videoId, guild, channel);
	if (doPrint) Util.sendDescEmbed(channel, "[Auto-Playlist-Started]", "Playing " + video.snippet.title, Util.makeEmbedFooter(null), null, 0x00E676);
};

exports.streamAudio = function(remote, guild, channel) {
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

	console.log("Streaming Audio: " + remote);
	const streamOptions = {seek: 0, volume: 0.2};

	const stream = Ytdl(remote, {filter: 'audioonly'});
	const dispatcher = connection.playStream(stream, streamOptions);

	exports.isPlaying[guild.id] = true;

	dispatcher.on("error", error => {
		console.log(error);
	});

	dispatcher.on("end", reason => {
		if (reason == "NewStreamAudio" || reason == "StopMusic") return;
		if (exports.isPlaying[guild.id]) {
			console.log("Track Ended: " + reason);
			var realSongData = exports.songData[guild.id];
			var realSongs = exports.songs[guild.id];

			if (realSongs.length > 0) {
				var video = realSongs[0][0];
				var videoId = typeof(video.id) == "object" ? video.id.videoId : video.id;
				if (videoId == remote) realSongs.splice(0, 1);
			}

			if (voiceChannel.members.size > 1) {
				var autoPlaylist = Data.guildGet(guild, Data.playlist);
				if (realSongs.length === 0 && realSongData.isAuto === true) {
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
	});
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
		if (reason == "NewStreamAudio" || reason == "StopMusic") return;
		if (exports.isPlaying[guild.id]) {
			console.log("Track Ended: " + reason);
			var realSongData = exports.songData[guild.id];
			var realSongs = exports.songs[guild.id];

			if (realSongs.length > 0) {
				var video = realSongs[0][0];
				var videoId = typeof(video.id) == "object" ? video.id.videoId : video.id;
				if (videoId == name) realSongs.splice(0, 1);
			}

			if (voiceChannel.members.size > 1) {
				var autoPlaylist = Data.guildGet(guild, Data.playlist);
				if (realSongs.length === 0 && realSongData.isAuto === true) {
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

exports.addSong = function(speaker, guild, channel, video) {
	var realSongs = exports.songs[guild.id];
	realSongs.push([video, speaker]);
	if (realSongs.length <= 1 || exports.songData[guild.id].isAuto === true) {
		exports.playNextQueue(guild, channel, true);
	} else {
		Util.sendDescEmbed(channel, "[" + realSongs.length + "] Audio Queue Appended", video.snippet.title, Util.makeEmbedFooter(speaker), null, 0x00E676);
	}
};
