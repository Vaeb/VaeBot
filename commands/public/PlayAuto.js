module.exports = Cmds.addCommand({
    cmds: [";playauto ", ";playa "],

    requires: {
        guild: true,
        loud: false
    },

    desc: "Plays a tune already stored in the auto-playlist",

    args: "[song_name]",

    example: "gonna give you up",

    ///////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        args = args.toLowerCase();
        var autoPlaylist = Data.guildGet(guild, Data.playlist);
        var autoSongs = autoPlaylist.songs;
        for (var i = 0; i < autoSongs.length; i++) {
            var newSong = autoSongs[i];
            var songData = newSong[0];
            var author = newSong[1];
            var title = songData.snippet.title;
            if (title.toLowerCase().indexOf(args) >= 0) {
                Music.joinMusic(guild, channel, (connection) => {
                    Music.addSong(speaker, guild, channel, Music.formatSong(songData, false));
                });
                break;
            }
        }
    }
});