module.exports = Cmds.addCommand({
    cmds: [';clearqueue'],

    requires: {
        guild: true,
        loud: false,
    },

    desc: "Clears VaeBot's queue of music",

    args: '',

    example: '',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        Music.clearQueue(guild);
        Util.print(channel, 'Cleared queue');
    },
});
