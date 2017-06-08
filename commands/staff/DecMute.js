module.exports = Cmds.addCommand({
    cmds: [';decmute ', ';decwarn '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: "Halves a user's mute",

    args: '([@user] | [id] | [name])',

    example: 'vae',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        const target = Util.getMemberByMixed(args, guild);

        if (target == null) return Util.commandFailed(channel, speaker, 'User not found');

        const speakerId = speaker.id;
        const targetId = target.id;

        const mutedGuild = Data.guildGet(guild, Data.muted);
        const nowMute = mutedGuild[targetId];

        if (nowMute == null) return Util.commandFailed(channel, speaker, 'Muted user not found');

        const reason = nowMute[3];
        const origModId = nowMute[4];

        const pos = Util.getPosition(speaker);

        const origMod = Util.getMemberById(origModId, guild);
        const origModPos = origMod != null ? Util.getPosition(origMod) : -1;

        if (speakerId !== vaebId && speakerId !== selfId && (origModId === vaebId || pos < origModPos)) {
            console.log(`${speaker.name}_2Moderator who muted has higher privilege`);
            Util.commandFailed(channel, speaker, '2Moderator who muted has higher privilege');
            return undefined;
        }

        const timeRemaining = Mutes.doMute(target, reason, guild, Util.getPosition(speaker), channel, speaker, true, 0.5);

        const sendEmbedFields = [
            { name: 'Username', value: Util.getMention(target) },
            { name: 'Time Remaining', value: timeRemaining },
        ];
        Util.sendEmbed(channel, 'Mute Decreased', null, Util.makeEmbedFooter(speaker), null, 0x00E676, sendEmbedFields);

        return undefined;
    },
});
