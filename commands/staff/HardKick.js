module.exports = Cmds.addCommand({
    cmds: [';hardkick ', ';hardeject ', ';softban '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Kick a user from the guild (extra hard)', // Does this command even do anything?????????????????

    args: '([@user] | [id] | [name]) ([reason])',

    example: 'vaeb being weird',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        if (speaker.id == '138274235435974656') return Util.commandFailed(channel, speaker, 'Temporarily disabled kick permissions for this moderator as a precaution due to complaints');
        const data = Util.getDataFromString(args, [
            function (str) {
                return Util.getMemberByMixed(str, guild);
            },
        ], true);
        if (!data) return Util.commandFailed(channel, speaker, 'User not found');
        const target = data[0];
        const reason = data[1];
        if (Util.getPosition(speaker) <= Util.getPosition(target)) {
            Util.commandFailed(channel, speaker, 'User has equal or higher rank');
            return false;
        }
        const targName = Util.getName(target);
        const targId = Util.safe(target.id);

        const outStr = ['**You have been hard-kicked**\n```'];
        outStr.push(`Guild: ${guild.name}`);
        outStr.push(`Reason: ${reason}`);
        outStr.push('What is a hardkick: Hardkicks ban and instantly unban the user, causing their recent messages to be deleted and possibly causing Discord to temporarily cache their IP as banned.');
        outStr.push('```');
        Util.print(target, outStr.join('\n'));

        guild.ban(target.id, { days: 1, reason })
            .then(() => {
                guild.unban(target.id)
                    .catch(Util.logErr);
            })
            .catch(Util.logErr);

        Util.print(channel, 'Hard Kicked', Util.fix(targName), `(${targId}) for`, Util.fix(reason));
        if (guild.id == '168742643021512705') index.dailyKicks.push([targId, `${targName}#${target.discriminator}`, reason]);

        const sendLogData = [
            'Guild Hard Kick',
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
