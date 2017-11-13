module.exports = Cmds.addCommand({
    cmds: [';mute ', ';mutehammer '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Mute a user (in all guild channels) and add the mute to their record',

    args: '([user_resolvable]) (OPTIONAL: [mute_length]) (OPTIONAL: [mute_length_format]) (OPTIONAL: [reason])',

    example: 'vae 2 minutes being weird',

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
            return Util.sendEmbed(channel, 'Mute Failed', 'User not found', Util.makeEmbedFooter(speaker), null, colGreen, null);
        }

        Util.log(`Change Arg Data: ${data}`);

        const member = data[0];
        const mult = data[2] || 1/60;
        const time = data[1] ? data[1] * 1000 * 60 * 60 * mult : null;
        const reason = data[3];

        /* if (speaker.id == '119203482598244356') {
            member = speaker;
            speaker = speaker.displayName;
        } */

        if (Admin.checkMuted(guild, member.id)) {
            Util.print(channel, `Eurghh... Are you sure you want to re-mute that guy instead of using \`;changemute\` <@${speaker.id}>...?\nI do hope you realised that he was already muted...`);

            const isResponse = msgObjTemp => msgObjTemp.author.id == speaker.id && msgObjTemp.content.includes(selfId);

            channel.awaitMessages(isResponse, { max: 1, time: 1000 * 15, errors: ['time'] })
                .then((collected) => {
                    const response = collected.first();
                    if (/y[aeiouy]+?[sh]|y[aeiy]+?\b|\by\b/.test(response.content.toLowerCase())) {
                        Util.print(channel, 'Well okay then, it\'s your choice, I just hope it\'s not a retarded one...');
                        Admin.addMute(guild, channel, member, speaker, { time, reason });
                    } else {
                        Util.print(channel, 'Guess you made a mistake eh... Well fine, your request has been cancelled.');
                    }
                })
                .catch(() => {
                    Util.print(channel, `What a drag, I've been waiting far too long for an answer <@${speaker.id}>, snails get stitches...`);
                    Admin.addMute(guild, channel, speaker, speaker, { time: 1000 * 60, reason: 'Snails get stitches' });
                });
        }

        return true;
    },
});
