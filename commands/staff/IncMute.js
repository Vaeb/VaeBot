module.exports = Cmds.addCommand({
    cmds: [';incmute ', ';incwarn '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: "Doubles a user's mute",

    args: '([@user] | [id] | [name])',

    example: 'vae',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        const target = Util.getMemberByMixed(args, guild);

        if (target == null) return Util.commandFailed(channel, speaker, 'User not found');

        const targetId = target.id;

        const mutedGuild = Data.guildGet(guild, Data.muted);

        const nowMute = mutedGuild[targetId];

        if (nowMute == null) return Util.commandFailed(channel, speaker, 'Muted user not found');

        const reason = nowMute[3];

        const timeRemaining = Mutes.doMute(target, reason, guild, Util.getPosition(speaker), channel, speaker, true);

        const sendEmbedFields = [
            { name: 'Username', value: Util.getMention(target) },
            { name: 'Time Remaining', value: timeRemaining },
        ];
        Util.sendEmbed(channel, 'Mute Increased', null, Util.makeEmbedFooter(speaker), null, 0x00E676, sendEmbedFields);

        return undefined;
    },
});
