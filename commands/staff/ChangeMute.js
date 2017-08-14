module.exports = Cmds.addCommand({
    cmds: [';changemute ', ';change ', ';setmute ', 'altermute '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Change details of an active mute',

    args: '([user_resolvable]) (OPTIONAL: [mute_length]) (OPTIONAL: [mute_length_format]) (OPTIONAL: [reason])',

    example: 'vae 3 spamming multiple channels',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
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
                        const timeHours = Util.matchWholeNumber(str);
                        return timeHours;
                    },
                ],
                [
                    function (str) {
                        let mult;
                        str = str.toLowerCase();
                        if (str.substr(str.length - 1, 1) == 's' && str != 'ms' && str != 's') str = str.substr(0, str.length - 1);
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
            return Util.sendEmbed(channel, 'ChangeMute Failed', 'User not found', Util.makeEmbedFooter(speaker), null, colGreen, null);
        }

        Util.log(`Change Arg Data: ${data}`);

        const member = data[0];
        const mult = data[2] || 1;
        const time = data[1] ? data[1] * 1000 * 60 * 60 * mult : null;
        const reason = data[3];

        Admin.changeMute(guild, channel, member, speaker, { 'time': time, 'reason': reason });

        return true;
    },
});
