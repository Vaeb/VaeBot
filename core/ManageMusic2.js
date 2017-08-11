/*

    -exports.queue = {
        guildId: {
            canPlay,
            textChannel,
            playing,
            dispatcher,
            volume,
            songs: [
                songData {
                    source // Stream URL or File location
                    type // 'stream' or 'file'
                    name // Song name
                    addedBy // Guild member who added song or 'AutoPlaylist'
                },
                ...
            ]
        },
        ...
    }

    -exports.autoPlaylist = {
        guildId: [
            songData {},
            ...
        ],
        ...
    }

    -exports.textChannel(guild, channelResolvable)
    -exports.triggerPlay(guild) // Plays the song at start of queue or auto playlist, stops current song if playing (causing it to start the next one)
    -exports.addSong(guild, channel, nameResolvable, position)
    -exports.remSong(guild, channel, positionResolvable)
    -exports.setPosition(guild, channel, oldPositionResolvable, newPositionResolvable, trigger)
    -exports.pause(guild, channel)
    -exports.resume(guild, channel)
    -exports.stop(guild, channel)
    -exports.skip(guild, channel)
    -exports.voteSkip(guild, channel)
    -exports.getTime(guild)
    -exports.getStatus(guild)
    -exports.setVolume(guild, channel, newVolume, addVolume)
    -exports.join(guild, channel, channelResolvable)
    -exports.leave(guild, channel)
    -exports.addSongAuto(guild, channel, nameResolvable, position)
    -exports.remSongAuto(guild, channel, positionResolvable)

    -exports.triggerPlay(guild)
        -Check guild queue exists
        -Set textChannel variable to guild queue textChannel or guild default channel
        -Check guild queue has canPlay enabled
        -If no guild voice connection (not in voice channel)
            -[Await] Join voice channel
            -return exports.triggerPlay(guild)
        -If already playing
            -End current dispatcher
            -Return true
        -Set songData to first song in queue or random auto-playlist song
        -Get stream if songData is of type URL
        -Set dispatcher
        -Set playing
        -On dispatcher end
            // Remember that canPlay may be disabled at this point
            -Reset playing & dispatcher
            -exports.triggerPlay(guild)
        -On dispatcher error
            // Remember that canPlay may be disabled at this point
            -Reset playing & dispatcher
            -Output error
            -exports.triggerPlay(guild)
        -Return true

    -Call: exports.triggerPlay(guild)

*/

exports.queue = {};
exports.autoPlaylist = {};

exports.initGuild = async function (guild) {
    Util.log(`Initialising music queue for ${guild.name}`);

    exports.queue[guild.id] = {
        canPlay: true,
        textChannel: null,
        playing: false,
        dispatcher: null,
        volume: 50, // *100
        songs: [],
    };

    exports.autoPlaylist[guild.id] = [];

    const autoPlaylistData = Util.cloneObj(await Data.getRecords(guild, 'autoplaylist'));

    for (let i = 0; i < autoPlaylistData.length; i++) {
        exports.autoPlaylist[guild.id].push(autoPlaylistData[i]);
    }
};

exports.textChannel = function (guild, channelResolvable) {
    if (!has.call(exports.queue, guild.id)) return Util.commandFailed(guild.defaultTextChannel, 'System', 'Internal Error', 'Guild queue not initialized');
    const guildQueue = exports.queue[guild.id];
    const newTextChannel = Util.findTextChannel(channelResolvable, guild);
    if (!newTextChannel) return Util.commandFailed(guildQueue.textChannel || guild.defaultTextChannel, 'System', 'Channel not found');
    guildQueue.textChannel = newTextChannel;
    return true;
};

exports.join = async function (guild, channel, voiceChannelResolvable) {
    if (voiceChannelResolvable == null) voiceChannelResolvable = Util.findVoiceChannel('music', guild);
    if (voiceChannelResolvable == null) return Util.commandFailed(channel, 'System', 'Default (music) channel not found');
    if (typeof voiceChannelResolvable === 'string') voiceChannelResolvable = Util.findVoiceChannel(voiceChannelResolvable, guild);
    if (voiceChannelResolvable == null) return Util.commandFailed(channel, 'System', 'Channel not found');
    return voiceChannelResolvable.join();
};

exports.triggerPlay = async function (guild) {
    if (!has.call(exports.queue, guild.id)) await exports.initGuild(guild);

    const guildQueue = exports.queue[guild.id];
    const guildAuto = exports.autoPlaylist[guild.id];
    const textChannel = guildQueue.textChannel || guild.defaultTextChannel; // defaultTextChannel?

    if (!guildQueue.canPlay) return false;

    if (!guild.voiceConnection) {
        await exports.join(guild, textChannel);
        return exports.triggerPlay(guild);
    }

    if (guildQueue.playing) {
        guildQueue.dispatcher.end();
        return true;
    }

    const songData = guildQueue.songs[0] || guildAuto[Util.getRandomInt(0, guildAuto.length)];

    if (songData.type === 'stream') {
        const streamData = index.Ytdl(songData.source, { filter: 'audioonly' });
        guildQueue.dispatcher = guild.voiceConnection.playStream(streamData, { volume: guildQueue.volume / 100 });
    } else if (songData.type === 'file') {
        guildQueue.dispatcher = guild.voiceConnection.playFile(songData.source);
    } else {
        return Util.commandFailed(textChannel, 'System', 'Errr something\'s not quite right with the songData typing here');
    }

    guildQueue.playing = true;

    guildQueue.dispatcher.on('end', () => {
        guildQueue.playing = false;
        guildQueue.dispatcher = null;
        exports.triggerPlay(guild);
    });

    guildQueue.dispatcher.on('error', (err) => {
        guildQueue.playing = false;
        guildQueue.dispatcher = null;
        Util.commandFailed(textChannel, 'System', 'Internal Music Error', err);
        exports.triggerPlay(guild);
    });

    return true;
};

exports.formatSong = function (data, isFile) {
    if (!data) return 'Audio not found';

    if (isFile) data = { id: data, snippet: { title: data } };

    const songData = {
        source: typeof (data.id) === 'object' ? data.id.videoId : data.id,
        type: isFile ? 'file' : 'stream',
        name: data.snippet.title,
        addedBy: null,
    };

    return songData;
};

exports.getSong = function (nameResolvable) { // Cross your fingers and hope for promisify
    if (nameResolvable.includes('http')) {
        let songId = /[^/=]+$/.exec(nameResolvable);
        if (songId != null && songId[0]) {
            songId = songId[0];
            index.YtInfo.getById(songId, (error, result) => {
                const songData = result.items[0];
                return exports.formatSong(songData, false);
            });
        } else {
            return 'Incorrect format for URL';
        }
    } else {
        index.YtInfo.search(nameResolvable, 6, (error, result) => {
            if (error) return error;
            const items = result.items;
            for (let i = 0; i < items.length; i++) {
                const songData = items[i];
                if (songData != null && has.call(songData, 'id') && songData.id.kind == 'youtube#video') {
                    return exports.formatSong(songData, false);
                }
            }
            return 'Audio not found';
        });
    }
};

exports.addSong = function (guild, channel, nameResolvable, position) {
    if (!has.call(exports.queue, guild.id)) return Util.commandFailed(guild.defaultTextChannel, 'System', 'Internal Error', 'Guild queue not initialized');
    const guildQueue = exports.queue[guild.id];
    if (position == null) position = guildQueue.songs.length;
    return true;
};
