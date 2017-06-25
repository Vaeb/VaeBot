module.exports = Cmds.addCommand({
    cmds: [";psa"],

    requires: {
        guild: false,
        loud: false
    },

    desc: "PSA when restarting the bot for an update",

    args: "",

    example: "",

    ///////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        Util.sendDescEmbed(channel, null, "Restarting the bot for an update, it will be down for a few seconds", null, null, null);
    }
});