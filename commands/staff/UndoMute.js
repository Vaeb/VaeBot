module.exports = Cmds.addCommand({
    cmds: [';undomute ', ';popmute '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: "Remove a user's last mute from their record and unmute them if they are muted",

    args: '([@user] | [id] | [name])',

    example: 'vae',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        const target = Util.getMemberByMixed(args, guild);
        if (target == null) return Util.commandFailed(channel, speaker, 'User not found');

        Mutes.undoMute(target, guild, Util.getPosition(speaker), channel, speaker);

        return undefined;
    },
});
