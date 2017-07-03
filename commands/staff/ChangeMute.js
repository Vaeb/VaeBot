module.exports = Cmds.addCommand({
    cmds: [';changemute ', ';setmute ', 'altermute '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Change details of an active mute',

    args: '([@user] | [id] | [name]) ([mute_length_hours]) ([reason])',

    example: 'vae 3 spamming multiple channels',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        args = args.trim();

        const data = Util.getDataFromString(args, [
            function (str) {
                return Util.getMemberByMixed(str, guild) || Util.isId(str);
            },
        ], true);

        if (!data) {
            return Util.sendEmbed(channel, 'Mute Failed', 'User not found', Util.makeEmbedFooter(speaker), null, 0x00E676, null);
        }

        const data2 = Util.getDataFromString(data[1], [
            function (str) {
                const timeHours = Util.matchWholeNumber(str);
                return timeHours;
            },
        ], true);

        const member = data[0];
        let time;
        let reason;

        if (data2) {
            time = Number(data2[0]) * 1000 * 60 * 60;
            reason = data2[1];
        } else {
            reason = data[1];
        }

        Mutes.changeMute(guild, channel, member, speaker, { 'time': time, 'reason': reason });

        return true;
    },
});
