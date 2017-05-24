module.exports = Cmds.addCommand({
    cmds: [';warn ', ';warnhammer '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Mute a user (in all guild channels) for 0.5 hours, without putting it on their record',

    args: '([@user] | [id] | [name]) ([reason])',

    example: 'vae being weird',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        const position = Util.getPosition(speaker);

        Mutes.doMuteName(args, guild, position, channel, speaker, true);
    },
});
