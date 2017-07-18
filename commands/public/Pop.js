module.exports = Cmds.addCommand({
    cmds: [";undo", ";pop"],

    requires: {
        guild: true,
        loud: false
    },

    desc: "Remove the last song from the queue which was added by the speaker",

    args: "",

    example: "",

    ///////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        var guildQueue = Music.guildQueue[guild.id];
        Util.log("pop");
        // Util.log(guildQueue);
        Util.log("-------POP---------");
        if (guildQueue.length > 0) {
            for (var i = guildQueue.length-1; i >= 0; i--) {
                var lastSong = guildQueue[i];
                Util.log("Checking " + i + "_" + typeof(lastSong));
                if (lastSong[1].id == speaker.id) {
                    var title = lastSong[0].title;
                    Util.print(channel, "Removed", title, "from the queue");
                    var connection = guild.voiceConnection;
                    guildQueue.splice(i, 1);
                    if (connection != null && Music.guildMusicInfo[guild.id].activeSong != null && title == Music.guildMusicInfo[guild.id].activeSong.title) Music.playNextQueue(guild, channel, true);
                    break;
                }
            }
        }
    }
});