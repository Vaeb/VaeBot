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
                    type // 'URL' or 'File'
                    name // Song name
                    addedBy // Guild member who added song
                },
                ...
            ]
        },
        ...
    }

    -exports.autoPlaylist = {
        guildId: {
            songData {},
            ...
        },
        ...
    }

    -exports.textChannel(channelResolvable)
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
