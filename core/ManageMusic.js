const Ytdl = index.Ytdl;

exports.isPlaying = {};
exports.guildMusicInfo = {};
exports.guildQueue = {};
exports.noPlay = {};

exports.stopMusic = function (guild, reason) {
    const connection = guild.voiceConnection;
    if (!connection) return false;
    // const voiceChannel = connection.channel;
    const player = connection.player;
    if (!player) return false;
    const dispatcher = player.dispatcher;
    if (!dispatcher) return false;
    exports.isPlaying[guild.id] = false;
    dispatcher.end(reason);
    const guildMusicInfo = exports.guildMusicInfo[guild.id];
    guildMusicInfo.activeSong = null;
    guildMusicInfo.activeAuthor = null;
    guildMusicInfo.voteSkips = [];
    guildMusicInfo.isAuto = false;
    return true;
};

exports.clearQueue = function (guild) {
    exports.guildQueue[guild.id] = [];
    return exports.stopMusic(guild);
};

exports.chooseRandomSong = function (guild, autoPlaylist, lastId) {
    const autoSongs = autoPlaylist.songs;
    const newSong = autoSongs[Util.getRandomInt(0, autoSongs.length - 1)];
    const songData = exports.formatSong(newSong[0], false);
    const songInfo = [songData, newSong[1]];
    const songId = songData.id;
    if (autoSongs.length > 1 && songId === lastId) {
        return exports.chooseRandomSong(guild, autoPlaylist, lastId);
    }
    return songInfo;
};

exports.playRealSong = function (newSong, guild, channel, doPrintParam) {
    Util.log('Playing Real Song');
    let doPrint = doPrintParam;
    if (doPrintParam == null) doPrint = true;
    const songData = newSong[0];
    const author = newSong[1];
    const guildMusicInfo = exports.guildMusicInfo[guild.id];
    guildMusicInfo.activeSong = songData;
    guildMusicInfo.activeAuthor = author;
    guildMusicInfo.voteSkips = [];
    guildMusicInfo.isAuto = false;
    exports.streamAudio(songData, guild, channel);
    if (doPrint) {
        Util.sendDescEmbed(channel, `Playing ${songData.title}`,
            `Added by ${Util.safeEveryone(author.toString())}`,
            Util.makeEmbedFooter(author), null, colGreen);
    }
};

exports.playNextQueue = function (guild, channel, doPrintParam) {
    Util.log('Called Playing Next Queue');
    let doPrint = doPrintParam;
    if (doPrintParam == null) doPrint = true;
    const guildQueue = exports.guildQueue[guild.id];
    const autoPlaylist = Data.guildGet(guild, Data.playlist);
    Util.log('guildQueue');
    Util.log(guildQueue.length);
    Util.log('-------Playing Next Queue---------');
    if (guildQueue.length > 0) {
        const newSong = guildQueue[0];
        exports.playRealSong(newSong, guild, channel, doPrint);
    } else if (autoPlaylist.songs && autoPlaylist.songs.length > 0) {
        Util.log('Playing Next Queue, Playing Next Auto');
        exports.playNextAuto(guild, channel, true);
    } else {
        exports.stopMusic(guild);
    }
};

exports.playNextAuto = function (guild, channel, doPrint) {
    const autoPlaylist = Data.guildGet(guild, Data.playlist);
    if (!autoPlaylist.songs || autoPlaylist.songs.length === 0) {
        exports.stopMusic(guild);
        return;
    }
    const guildMusicInfo = exports.guildMusicInfo[guild.id];
    let lastId = '';
    if (guildMusicInfo.isAuto === true) lastId = guildMusicInfo.activeSong.id;
    const newSong = exports.chooseRandomSong(guild, autoPlaylist, lastId);
    const songData = newSong[0];
    const author = newSong[1];
    /* var newSongNum = songNum+1;
    if (newSongNum >= autoSongs.length) newSongNum = 0;
    autoPlaylist.songNum = newSongNum;
    Data.guildSaveData(Data.playlist); */
    Util.log('Playing Next Auto');
    guildMusicInfo.activeSong = songData;
    guildMusicInfo.activeAuthor = author;
    guildMusicInfo.voteSkips = [];
    guildMusicInfo.isAuto = true;
    exports.streamAudio(songData, guild, channel);
    if (doPrint) Util.sendDescEmbed(channel, '[Auto-Playlist-Started]', `Playing ${songData.title}`, Util.makeEmbedFooter(null), null, colGreen);
};

exports.streamAudio = function (songData, guild, channel) {
    let connection = guild.voiceConnection;
    if (connection == null) return Util.commandFailed(channel, 'System', 'Bot is not connected to a Voice Channel');

    const oldPlayer = connection.player;

    if (oldPlayer) {
        const oldDispatcher = oldPlayer.dispatcher;
        if (oldDispatcher) {
            Util.log('Ended previous!');
            oldDispatcher.end('NewStreamAudio');
        }
    }

    const songId = songData.id;
    const isFile = songData.isFile;

    setTimeout(() => {
        connection = guild.voiceConnection;
        if (connection == null) return Util.commandFailed(channel, 'System', 'Bot is not connected to a Voice Channel');

        const voiceChannel = connection.channel;

        Util.log(`Streaming Audio: ${songId}`);

        const streamOptions = { seek: 0, volume: 0.2 };
        let dispatcher;

        if (!isFile) {
            const stream = Ytdl(songId, { filter: 'audioonly' });
            dispatcher = connection.playStream(stream, streamOptions);
        } else {
            dispatcher = connection.playFile(`/var/files/VaeBot/resources/music/${songId}.mp3`);
        }

        exports.isPlaying[guild.id] = true;

        dispatcher.on('error', (error) => {
            Util.log(`StreamError: ${error}`);
        });

        dispatcher.on('end', (reason) => {
            Util.log(`Track Ended: ${reason}`);
            if (reason === 'Stream is not generating quickly enough.' || reason === 'stream') {
                if (exports.isPlaying[guild.id]) {
                    Util.log(`Track Ended, Starting Next: ${reason}`);
                    const guildMusicInfo = exports.guildMusicInfo[guild.id];
                    const guildQueue = exports.guildQueue[guild.id];

                    if (guildQueue.length > 0) {
                        const songData2 = guildQueue[0][0];
                        const songId2 = songData2.id;
                        if (songId2 === songId) guildQueue.splice(0, 1);
                    }

                    if (voiceChannel.members.size > 1) {
                        // const autoPlaylist = Data.guildGet(guild, Data.playlist);
                        if (guildQueue.length === 0 && guildMusicInfo.isAuto === true) {
                            Util.log('Track Ended, Playing Next Auto');
                            exports.playNextAuto(guild, channel);
                        } else {
                            exports.playNextQueue(guild, channel, true);
                        }
                    } else {
                        exports.stopMusic(guild);
                        Util.print(channel, 'Auto stopping audio | No users in voice');
                    }
                }
            }
        });

        return undefined;
    }, 1000);

    return undefined;
};

exports.playFile = function (name, guild, channel) {
    const connection = guild.voiceConnection;
    if (connection == null) return Util.commandFailed(channel, 'System', 'Bot is not connected to a Voice Channel');
    // const voiceChannel = connection.channel;

    const oldPlayer = connection.player;
    if (oldPlayer) {
        const oldDispatcher = oldPlayer.dispatcher;
        if (oldDispatcher) {
            Util.log('Ended previous!');
            oldDispatcher.end('NewStreamAudio');
        }
    }

    Util.log(`Playing File: ${name}`);
    // const streamOptions = { seek: 0, volume: 0.2 };

    const dispatcher = connection.playFile(`/var/files/VaeBot/resources/music/${name}.mp3`);

    exports.isPlaying[guild.id] = true;

    dispatcher.on('error', (error) => {
        Util.log(error);
    });

    dispatcher.on('end', (reason) => {
        Util.log(reason);
    });

    return undefined;
};

exports.joinMusic = function (guild, channel, func) {
    const connection = guild.voiceConnection;
    if (connection == null) {
        const musicChannel = Util.findVoiceChannel('music', guild);
        if (musicChannel) {
            musicChannel.join()
                .then((connection2) => {
                    func(connection2);
                })
                .catch(error => Util.log(`[E_JoinMusic] ${error}`));
        } else {
            Util.print(channel, 'Not connected to a voice channel');
        }
    } else {
        func(connection);
    }
};

exports.formatSong = function (data, isFile) {
    if (isFile) {
        return {
            id: data,
            title: data,
            isFile: true,
        };
    }
    return {
        id: typeof (data.id) === 'object' ? data.id.videoId : data.id,
        title: data.snippet.title,
        isFile: false,
    };
};

exports.addSong = function (speaker, guild, channel, songData) {
    const guildQueue = exports.guildQueue[guild.id];
    guildQueue.push([songData, speaker]);
    if (guildQueue.length <= 1 || exports.guildMusicInfo[guild.id].isAuto === true) {
        exports.playNextQueue(guild, channel, true);
    } else {
        Util.sendDescEmbed(channel, `[${guildQueue.length}] Audio Queue Appended`, songData.title, Util.makeEmbedFooter(speaker), null, colGreen);
    }
};
