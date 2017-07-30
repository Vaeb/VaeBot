module.exports = Cmds.addCommand({
    cmds: [";nowplaying", ";np"],

    requires: {
        guild: true,
        loud: false
    },

    desc: "Get info about the currently playing song",

    args: "",

    example: "",

    ///////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        var guildMusicInfo = Music.guildMusicInfo[guild.id];
        if (guildMusicInfo.activeSong != null) {
            Util.sendDescEmbed(channel, "Now Playing", guildMusicInfo.activeSong.title, Util.makeEmbedFooter(speaker), null, colGreen);
        } else {
            Util.sendDescEmbed(channel, "Now Playing", "No songs are being played", Util.makeEmbedFooter(speaker), null, colGreen);
        }
    }
});