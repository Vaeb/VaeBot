module.exports = Cmds.addCommand({
    cmds: [";leave", ";exit"],

    requires: {
        guild: true,
        loud: false
    },

    desc: "Make VaeBot leave it's voice channel",

    args: "",

    example: "",

    ///////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        Music.clearQueue(guild);
        var connection = guild.voiceConnection;
        if (!connection) return Util.commandFailed(channel, speaker, "Not in a voice channel");
        var voiceChannel = connection.channel;
        connection.disconnect();
        Util.sendDescEmbed(channel, "Left Voice Channel", voiceChannel.name, Util.makeEmbedFooter(speaker), null, colGreen);
    }
});