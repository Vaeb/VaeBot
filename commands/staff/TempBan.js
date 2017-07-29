module.exports = Cmds.addCommand({
    cmds: [';tempban ', ';temporaryban ', ';timeban ', ';bantime ', ';muteban '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Temporarily ban a user from the guild',

    args: '([@user] | [id] | [name]) (OPT: [ban_length]) (OPT: [ban_length_format]) (OPT: [reason])',

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
            return Util.sendEmbed(channel, 'Ban Failed', 'User not found', Util.makeEmbedFooter(speaker), null, 0x00E676, null);
        }

        Util.log(`Change Arg Data: ${data}`);

        const member = data[0];
        const mult = data[2] || 1;
        const time = data[1] ? data[1] * 1000 * 60 * 60 * mult : null;
        const reason = data[3];

        // Check if allowed to ban this user
        if (Mutes.notHigherRank(speaker, member)) {
            return Util.commandFailed(channel, speaker, 'Temporary Ban', 'User has equal or higher rank');
        }

        // Get data
        const startTick = +new Date();
        const endTick = startTick + await Mutes.getNextMuteTimeFromUser(guild, member, time, reason);

        // Store ban data in database
        const newRecord = {
            'ban_id': Data.nextInc('bans'), // AUTO INCREMENT
            'user_id': member.id, // VARCHAR(24)
            'mod_id': speaker.id, // VARCHAR(24)
            'ban_reason': reason, // TEXT
            'start_tick': startTick, // BIGINT
            'end_tick': endTick, // BIGINT
            'active': 1, // BIT
        };

        Data.addRecord(guild, 'bans', newRecord);

        // Message the user with relevant info

        // Ban the member
        Util.banMember(member, speaker, reason);

        return true;
    },
});
