module.exports = Cmds.addCommand({
    cmds: [";stop", ";silence"],

    requires: {
        guild: true,
        loud: false
    },

    desc: "Cancel the party, the bangin' tunes can wait for another day",

    args: "[song_name]",

    example: "gonna give you up",

    ///////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        var guildQueue = Music.guildQueue[guild.id];
        var guildMusicInfo = Music.guildMusicInfo[guild.id];
        var connection = guild.voiceConnection;
        if (connection) {
            if (Music.isPlaying[guild.id]) {
                if (guildMusicInfo.isAuto == false) guildQueue.splice(0, 1);
                Music.stopMusic(guild);
                Util.print(channel, "Stopping audio");
            } else {
                Util.print(channel, "No audio playing");
            }
        } else {
            Util.print(channel, "No audio found");
        }
    }
});