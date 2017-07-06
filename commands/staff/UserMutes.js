module.exports = Cmds.addCommand({
    cmds: [';mutes ', ';usermutes ', ';history ', ';userhistory '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Get the mute history of a user',

    args: '([@user] | [id] | [name])',

    example: 'vae',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: async (cmd, args, msgObj, speaker, channel, guild) => {
        const data = Util.getDataFromString(args, [
            function (str) {
                return Util.getMemberByMixed(str, guild);
            },
        ], false);
        if (!data) return Util.commandFailed(channel, speaker, 'User not found');

        const member = data[0];

        const pastMutes = await Data.getRecords(guild, 'mutes', { user_id: member.id });

        const sendEmbedFields = [];

        for (let i = 0; i < pastMutes.length; i++) {
            const row = pastMutes[i];

            const muteDate = new Date(row.start_tick);
            const muteLength = row.end_tick - row.start_tick;
            const moderatorId = row.mod_id;

            const reason = row.mute_reason;
            const muteDateStr = Util.getDateString(muteDate);
            const muteLengthStr = Util.formatTime(muteLength);
            const modMention = Util.resolveUserMention(guild, moderatorId);

            sendEmbedFields.push({ name: `[${i + 1}] ${muteDateStr}`, value: `​Reason: ${reason}\nLength: ${muteLengthStr}\nModerator: ${modMention}`, inline: false });
        }

        Util.sendEmbed(channel, `Mute History: ${Util.getMostName(member)}`, null, Util.makeEmbedFooter(speaker), null, 0x00BCD4, sendEmbedFields);

        return true;
    },
});
