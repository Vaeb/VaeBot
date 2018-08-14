module.exports = Cmds.addCommand({
    cmds: [';unmute ', ';unwarn ', ';unmutehammer ', ';free '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Unmute a user',

    args: '([user_resolvable])',

    example: 'vae',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        args = args.trim();

        Admin.unMute(guild, channel, args, speaker);
    },
});
