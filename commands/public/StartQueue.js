module.exports = Cmds.addCommand({
    cmds: [";startqueue"],

    requires: {
        guild: true,
        loud: false
    },

    desc: "Start playing the queued music",

    args: "",

    example: "",

    ///////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        Music.joinMusic(guild, channel, connection => {
            var guildQueue = Music.guildQueue[guild.id];
            if (guildQueue.length > 0) {
                Music.playNextQueue(guild, channel, true);
            } else {
                Util.print(channel, "No songs in queue");
            }
        });
    }
});