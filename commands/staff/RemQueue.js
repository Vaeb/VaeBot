module.exports = Cmds.addCommand({
    cmds: [";remqueue ", ";remq "],

    requires: {
        guild: true,
        loud: false
    },

    desc: "Remove a song from the music queue",

    args: "[song_name]",

    example: "gonna give you up",

    ///////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        args = args.toLowerCase();
        var guildQueue = Music.guildQueue[guild.id];
        for (var i = guildQueue.length-1; i >= 0; i--) {
            var newSong = guildQueue[i];
            var songData = newSong[0];
            var author = newSong[1];
            var title = songData.title;
            if (title.toLowerCase().indexOf(args) >= 0) {
                Util.print(channel, "Removed", title, "from the queue");
                var connection = guild.voiceConnection;
                guildQueue.splice(i, 1);
                if (connection != null && Music.guildMusicInfo[guild.id].activeSong != null && title == Music.guildMusicInfo[guild.id].activeSong.title) Music.playNextQueue(guild, channel, true);
            }
        }
    }
});
