module.exports = Cmds.addCommand({
    cmds: [';tempban ', ';tban ', ';temporaryban ', ';timeban ', ';bantime '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Temporarily ban a user from the guild',

    args: '([user_resolvable]) (OPTIONAL: [ban_length]) (OPTIONAL: [ban_length_format]) (OPTIONAL: [reason])',

    example: 'vae 2 days repeatedly breaking rules',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: async (cmd, args, msgObj, speaker, channel, guild) => {
        args = args.trim();

        const data = Util.getDataFromString(args,
            [
                [
                    function (str) {
                        return Util.getMemberByMixed(str, guild) || Util.isId(str);
                    },
                ],
                [
                    function (str) {
                        return Util.matchWholeNumber(str);
                    },
                ],
                [
                    function (str) {
                        let mult;
                        str = str.toLowerCase();
                        if (str.substr(str.length - 1, 1) == 's' && str.length > 2) str = str.substr(0, str.length - 1);
                        if (str == 'millisecond' || str == 'ms') mult = 1 / 60 / 60 / 1000;
                        if (str == 'second' || str == 's' || str == 'sec') mult = 1 / 60 / 60;
                        if (str == 'minute' || str == 'm' || str == 'min') mult = 1 / 60;
                        if (str == 'hour' || str == 'h') mult = 1;
                        if (str == 'day' || str == 'd') mult = 24;
                        if (str == 'week' || str == 'w') mult = 24 * 7;
                        if (str == 'month' || str == 'mo') mult = 24 * 30.42;
                        if (str == 'year' || str == 'y') mult = 24 * 365.2422;
                        return mult;
                    },
                ],
            ]
            , true);

        if (!data) {
            return Util.sendEmbed(channel, 'Ban Failed', 'User not found', Util.makeEmbedFooter(speaker), null, colGreen, null);
        }

        Util.log(`Change Arg Data: ${data}`);

        const member = data[0];
        const mult = data[2] || 1;
        const time = data[1] ? data[1] * 1000 * 60 * 60 * mult : null;
        const reason = data[3];

        Admin.addBan(guild, channel, member, speaker, { time, reason, temp: true });

        return true;
    },
});
