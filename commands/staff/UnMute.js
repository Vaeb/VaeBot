module.exports = Cmds.addCommand({
    cmds: [';unmute ', ';unwarn ', ';unmutehammer '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Unmute a user',

    args: '([@user] | [id] | [name])',

    example: 'vae',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        args = args.trim();

        Admin.unMute(guild, channel, args, speaker);
    },
});
