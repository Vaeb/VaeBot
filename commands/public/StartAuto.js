module.exports = Cmds.addCommand({
    cmds: [";startauto", ";startap"],

    requires: {
        guild: true,
        loud: false
    },

    desc: "Start playing the auto-playlist music",

    args: "",

    example: "",

    ///////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        Music.joinMusic(guild, channel, connection => {
            var autoPlaylist = Data.guildGet(guild, Data.playlist);
            if (autoPlaylist.hasOwnProperty("songs") && autoPlaylist.songs.length > 0) {
                Util.log("Cmd, Playing Next Auto");
                Music.playNextAuto(guild, channel, true);
            } else {
                Util.print(channel, "No songs in the auto-playlist");
            }
        });
    }
});