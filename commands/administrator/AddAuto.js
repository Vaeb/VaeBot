module.exports = Cmds.addCommand({
    cmds: [';addauto ', ';adda ', ';addtoauto '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Adds a song to the music auto-playlist',

    args: '[song_name]',

    example: 'gonna give you up',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        // if (args.includes('http')) {
        //     let songId = /[^/=]+$/.exec(args);
        //     if (songId != null && songId[0]) {
        //         songId = songId[0];
        //         index.YtInfo.getById(songId, (error, result) => {
        //             const songData = result.items[0];
        //             if (songData != null) {
        //                 let autoPlaylist = Data.guildGet(guild, Data.playlist, 'songs');
        //                 if (autoPlaylist == null) {
        //                     autoPlaylist = [];
        //                     Data.guildSet(guild, Data.playlist, 'songNum', 0);
        //                     Data.guildSet(guild, Data.playlist, 'songs', autoPlaylist);
        //                 }
        //                 autoPlaylist.push([songData, speaker]);
        //                 Data.guildSaveData(Data.playlist);
        //                 Util.sendDescEmbed(channel, `[${autoPlaylist.length}] Auto-Playlist Appended`, songData.snippet.title, Util.makeEmbedFooter(speaker), null, colGreen);
        //             } else {
        //                 Util.print(channel, 'Audio not found');
        //             }
        //         });
        //     } else {
        //         Util.print(channel, 'Incorrect format for URL');
        //     }
        // } else {
        //     index.YtInfo.search(args, 6, (error, result) => {
        //         if (error) {
        //             Util.print(channel, error);
        //         } else {
        //             const items = result.items;
        //             let hasFound = false;
        //             for (let i = 0; i < items.length; i++) {
        //                 const songData = items[i];
        //                 if (songData != null && has.call(songData, 'id') && songData.id.kind == 'youtube#video') {
        //                     hasFound = true;
        //                     let autoPlaylist = Data.guildGet(guild, Data.playlist, 'songs');
        //                     if (autoPlaylist == null) {
        //                         autoPlaylist = [];
        //                         Data.guildSet(guild, Data.playlist, 'songNum', 0);
        //                         Data.guildSet(guild, Data.playlist, 'songs', autoPlaylist);
        //                     }
        //                     autoPlaylist.push([songData, speaker]);
        //                     Data.guildSaveData(Data.playlist);
        //                     Util.sendDescEmbed(channel, `[${autoPlaylist.length}] Auto-Playlist Appended`, songData.snippet.title, Util.makeEmbedFooter(speaker), null, colGreen);
        //                     break;
        //                 }
        //             }
        //             if (!hasFound) {
        //                 Util.print(channel, 'Audio not found');
        //             }
        //         }
        //     });
        // }
        // // Data.guildSet(guild, playlist, args);
    },
});
