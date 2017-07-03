module.exports = Cmds.addCommand({
    cmds: [';mute ', ';mutehammer '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Mute a user (in all guild channels) and add the mute to their record',

    args: '([@user] | [id] | [name]) ([mute_length_hours]) ([reason])',

    example: 'vae 2 being weird',

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
                let timeHours = str.match(/^\d+$/);
                timeHours = timeHours ? timeHours[0] : undefined;
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

        Mutes.addMute(guild, channel, member, speaker, { 'time': time, 'reason': reason });

        return true;
    },
});
