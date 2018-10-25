module.exports = Cmds.addCommand({
    cmds: [';kick ', ';eject '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Kick a user from the guild',

    args: '([@user] | [id] | [name]) ([reason])',

    example: 'vaeb being weird',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: async (cmd, args, msgObj, speaker, channel, guild) => {
        if (speaker.id == '138274235435974656') {
            return Util.commandFailed(
                channel,
                speaker,
                'Temporarily disabled kick permissions for this moderator as a precaution due to complaints',
            );
        }
        const data = Util.getDataFromString(
            args,
            [
                function (str) {
                    return Util.getMemberByMixed(str, guild);
                },
            ],
            true,
        );
        if (!data) return Util.commandFailed(channel, speaker, 'User not found');
        const target = data[0];
        const reason = data[1];
        if (Util.getPosition(speaker) <= Util.getPosition(target)) {
            Util.commandFailed(channel, speaker, 'User has equal or higher rank');
            return false;
        }
        const targName = Util.getName(target);
        const targId = Util.safe(target.id);

        const outStr = ['**You have been kicked**\n```'];
        outStr.push(`Guild: ${guild.name}`);
        outStr.push(`Reason: ${reason}`);
        outStr.push('```');
        await Util.print(target, outStr.join('\n'));

        Util.kickMember(target, speaker, reason);

        Util.print(channel, 'Kicked', Util.fix(targName), `(${targId}) for`, Util.fix(reason));
        if (guild.id == '168742643021512705') index.dailyKicks.push([targId, `${targName}#${target.discriminator}`, reason]);

        const sendLogData = [
            'Guild Kick',
            guild,
            target,
            { name: 'Username', value: target.toString() },
            { name: 'Moderator', value: speaker.toString() },
            { name: 'Kick Reason', value: reason },
        ];
        Util.sendLog(sendLogData, colAction);

        return true;
    },
});
