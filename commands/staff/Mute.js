module.exports = Cmds.addCommand({
    cmds: [';mute ', ';mutehammer ', ';arrest '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Mute a user (in all guild channels) and add the mute to their record',

    args: '([user_resolvable]) (OPTIONAL: [mute_length]) (OPTIONAL: [mute_length_format]) (OPTIONAL: [reason])',

    example: 'vae 2 minutes being weird',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: async (cmd, args, msgObj, speaker, channel, guild) => {
        args = args.trim();

        const data = Util.getDataFromString(
            args,
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
                        let timeMult;
                        str = str.toLowerCase();
                        if (str.substr(str.length - 1, 1) == 's' && str.length > 2) str = str.substr(0, str.length - 1);
                        if (str == 'millisecond' || str == 'ms') timeMult = 1 / 60 / 60 / 1000;
                        if (str == 'second' || str == 's' || str == 'sec') timeMult = 1 / 60 / 60;
                        if (str == 'minute' || str == 'm' || str == 'min') timeMult = 1 / 60;
                        if (str == 'hour' || str == 'h') timeMult = 1;
                        if (str == 'day' || str == 'd') timeMult = 24;
                        if (str == 'week' || str == 'w') timeMult = 24 * 7;
                        if (str == 'month' || str == 'mo') timeMult = 24 * 30.42;
                        if (str == 'year' || str == 'y') timeMult = 24 * 365.2422;
                        return timeMult;
                    },
                ],
            ],
            true,
        );

        if (!data) {
            return Util.sendEmbed(channel, 'Mute Failed', 'User not found', Util.makeEmbedFooter(speaker), null, colGreen, null);
        }

        Util.log(`Change Arg Data: ${data}`);

        const member = data[0];
        const mult = data[2] || 1 / 60;
        const time = data[1] ? data[1] * 1000 * 60 * 60 * mult : null;
        const reason = data[3];

        let success;

        /* if (speaker.id == '119203482598244356') {
            member = speaker;
            speaker = speaker.displayName;
        } */

        if (Admin.checkMuted(guild, member.id)) {
            Util.print(
                channel,
                `<@${
                    speaker.id
                }> Are you sure you want to re-mute that guy instead of using \`;changemute\`...?\n\n You only need to re-mute if it's a separate offense.`,
            );

            const isResponse = msgObjTemp => msgObjTemp.author.id == speaker.id;

            channel
                .awaitMessages(isResponse, { max: 1, time: 1000 * 25, errors: ['time'] })
                .then(async (collected) => {
                    const response = collected.first();
                    const responseMsg = response.content;

                    if (/y[aeiouy]+?[shp]|y[aeiy]+?\b|\by\b/.test(responseMsg.toLowerCase())) {
                        Util.print(channel, 'Well okay then, your will is my command...');
                        success = await Admin.addMute(guild, channel, member, speaker, { time, reason });
                    } else {
                        Util.print(channel, 'Guess you made a mistake eh... Well fine, your request has been cancelled.');
                    }
                })
                .catch(() => {
                    Util.print(
                        channel,
                        `What a drag, I've been waiting far too long for an answer <@${speaker.id}>, snails get stitches...`,
                    );
                    Admin.addMute(guild, channel, speaker, 'System', { time: 1000 * 60 * 1.5, reason: 'Snails get stitches' });
                });
        } else {
            success = await Admin.addMute(guild, channel, member, speaker, { time, reason });
        }

        if (time === null && success === true) {
            Util.print(
                channel,
                `This user was muted for their default mute time (based on their mute history), do you want to change it <@${
                    speaker.id
                }>? If you do, just tell me the new time now...`,
            );

            const isResponse = msgObjTemp => msgObjTemp.author.id == speaker.id;

            channel
                .awaitMessages(isResponse, { max: 1, time: 1000 * 25, errors: ['time'] })
                .then((collected) => {
                    const response = collected.first();
                    let responseMsg = response.content;

                    responseMsg = responseMsg
                        .replace(/<@.?\d+?>\s*/g, '')
                        .replace(/[^\sa-z0-9]+/gi, '')
                        .trim();

                    if (/\bno|no\b|\bcancel|\bkeep|\bdont|^n$/i.test(responseMsg)) {
                        Util.print(channel, 'Got it!');
                        return;
                    }

                    const data2 = Util.getDataFromString(
                        responseMsg,
                        [
                            [
                                function (str) {
                                    return Util.matchWholeNumber(str);
                                },
                            ],
                            [
                                function (str) {
                                    let timeMult;
                                    str = str.toLowerCase();
                                    if (str.substr(str.length - 1, 1) == 's' && str.length > 2) str = str.substr(0, str.length - 1);
                                    if (str == 'millisecond' || str == 'ms') timeMult = 1 / 60 / 60 / 1000;
                                    if (str == 'second' || str == 's' || str == 'sec') timeMult = 1 / 60 / 60;
                                    if (str == 'minute' || str == 'm' || str == 'min') timeMult = 1 / 60;
                                    if (str == 'hour' || str == 'h') timeMult = 1;
                                    if (str == 'day' || str == 'd') timeMult = 24;
                                    if (str == 'week' || str == 'w') timeMult = 24 * 7;
                                    if (str == 'month' || str == 'mo') timeMult = 24 * 30.42;
                                    if (str == 'year' || str == 'y') timeMult = 24 * 365.2422;
                                    return timeMult;
                                },
                            ],
                        ],
                        true,
                    );

                    if (!data2) return;

                    Util.log(`Change Arg Data New: ${data2}`);

                    const mult2 = data2[1] || 1 / 60;
                    const time2 = data2[0] ? data2[0] * 1000 * 60 * 60 * mult2 : null;

                    if (time2 == null) return;

                    Admin.changeMute(guild, channel, member, speaker, { time: time2 });
                })
                .catch(console.log);
        }

        return true;
    },
});
