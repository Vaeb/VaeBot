module.exports = Cmds.addCommand({
    cmds: [";skip"],

    requires: {
        guild: true,
        loud: false
    },

    desc: "Skip to the next song",

    args: "[song_name]",

    example: "gonna give you up",

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        var connection = guild.voiceConnection;
        if (connection) {
            var guildQueue = Music.guildQueue[guild.id];
            var autoPlaylist = Data.guildGet(guild, Data.playlist);
            var guildMusicInfo = Music.guildMusicInfo[guild.id];
            var firstInQueue = guildQueue[0];
            Util.log("Num songs in queue: " + guildQueue.length);
            if (Util.checkStaff(guild, speaker) || (guildMusicInfo.isAuto == false && guildMusicInfo.activeAuthor.id == speaker.id)) {
                if (guildMusicInfo.isAuto == false && guildQueue.length > 0 && guildMusicInfo.activeSong != null && guildMusicInfo.activeSong.title == firstInQueue[0].title) guildQueue.splice(0, 1);
                Util.log(guildMusicInfo.isAuto == false + " | " + guildQueue.length + " | " + guildMusicInfo.activeSong + " | " + ((guildMusicInfo.activeSong && firstInQueue) ? guildMusicInfo.activeSong.title == firstInQueue[0].title : "N/A") + " | " + (guildMusicInfo.activeSong ? guildMusicInfo.activeSong.title : "N/A") + " | " + (firstInQueue ? firstInQueue[0].title : "N/A"))
                Music.playNextQueue(guild, channel, true);
            } else {
                Util.print(channel, "You are not staff and you did not add this song");
            }
        }
    }
});