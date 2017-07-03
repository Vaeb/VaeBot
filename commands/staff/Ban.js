module.exports = Cmds.addCommand({
    cmds: [';ban ', ';permaban '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Ban a user from the guild',

    args: '([@user] | [id] | [name]) ([reason])',

    example: 'vaeb being weird',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
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
        // var dayMessages = Util.getInt(args);

        const outStr = ['**You have been banned**\n```'];
        outStr.push(`Guild: ${guild.name}`);
        outStr.push(`Reason: ${reason}`);
        outStr.push('```');
        Util.print(target, outStr.join('\n'));

        Util.banMember(target, speaker, reason);

        const sendEmbedFields = [
            { name: 'Username', value: target.toString() },
            { name: 'Ban Reason', value: reason },
        ];
        Util.sendEmbed(channel, 'User Banned', null, Util.makeEmbedFooter(speaker), Util.getAvatar(target), 0x00E676, sendEmbedFields);

        if (guild.id == '168742643021512705') index.dailyBans.push([targId, `${targName}#${target.discriminator}`, reason]);

        const sendLogData = [
            'Guild Ban',
            guild,
            target,
            { name: 'Username', value: target.toString() },
            { name: 'Moderator', value: speaker.toString() },
            { name: 'Ban Reason', value: reason },
        ];
        Util.sendLog(sendLogData, colAction);

        return true;
    },
});
