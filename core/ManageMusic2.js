/*

    -exports.queue = {
        guildId: [
            playing: false,
            songs: [
                songData {
                    source: '...' // URL or File location
                    type: '...' // 'URL' or 'File'
                    name: '...' // Song name
                    addedBy: GuildMember // Guild member who added song
                }
            ]
        ]
    }

    -exports.triggerPlay(guild, channel, triggerId) // Plays the song at start of queue or auto playlist, stops current song if playing, stops current triggerPlay call if exists (incrementing triggerId)
    -exports.addSong(guild, channel, nameResolvable, position)
    -exports.remSong(guild, channel, positionResolvable)
    -exports.setPosition(guild, channel, oldPositionResolvable, newPositionResolvable, trigger)
    -exports.pause(guild, channel)
    -exports.resume(guild, channel)
    -exports.stop(guild, channel)
    -exports.skip(guild, channel)
    -exports.getTime(guild, channel)
    -exports.setVolume(guild, channel, newVolume, addVolume)
    -exports.join(guild, channel, channelResolvable)
    -exports.leave(guild, channel)
    -exports.addSongAuto(guild, channel, nameResolvable, position)
    -exports.remSongAuto(guild, channel, positionResolvable)
    -exports.setPositionAuto(guild, channel, oldPositionResolvable, newPositionResolvable, trigger)

*/
