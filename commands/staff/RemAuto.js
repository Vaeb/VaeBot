module.exports = Cmds.addCommand({
    cmds: [';remauto ', ';rema '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Remove a song from the music auto-playlist',

    args: '[song_name]',

    example: 'gonna give you up',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        // args = args.toLowerCase();
        // var autoPlaylist = Data.guildGet(guild, Data.playlist);
        // var autoSongs = autoPlaylist.songs;
        // for (var i = autoSongs.length-1; i >= 0; i--) {
        //     var newSong = autoSongs[i];
        //     var songData = newSong[0];
        //     var author = newSong[1];
        //     var title = songData.snippet.title;
        //     if (title.toLowerCase().indexOf(args) >= 0) {
        //         Util.print(channel, "Removed", title, "from the auto-playlist");
        //         autoSongs.splice(i, 1);
        //     }
        // }
        // Data.guildSaveData(Data.playlist);
    },
});
