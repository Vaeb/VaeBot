module.exports = Cmds.addCommand({
    cmds: [';tempbans', ';tbans', ';timebans', ';timedbans'],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Get all temporarily banned users',

    args: '',

    example: '',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: async (cmd, args, msgObj, speaker, channel, guild) => {
        const activeBans = await Data.getRecords(guild, 'bans', { active: 1 });

        const nowDate = +new Date();

        const sendEmbedFields = [];

        for (let i = 0; i < activeBans.length; i++) {
            const record = activeBans[i];
            const targetId = record.user_id;
            const modId = record.mod_id;
            const startTime = record.start_tick;
            const endTime = record.end_tick;
            const reason = record.ban_reason;

            const remaining = endTime - nowDate;
            const timeStr = Util.formatTime(remaining);
            // const targUser = Util.getUserById(targetId);
            // const targName = targUser == null ? targetId : Util.getMostName(targUser);
            const startDate = new Date(startTime);
            const startDateStr = Util.getDateString(startDate);

            sendEmbedFields.push({ name: `[${i + 1}] ${startDateStr}`, value: `​User: <@${targetId}>\nReason: ${reason}\nModerator: <@${modId}>\nRemaining: ${timeStr}​`, inline: false });
        }

        Util.sendEmbed(channel, 'Temporary Bans', null, Util.makeEmbedFooter(speaker), null, colBlue, sendEmbedFields);
    },
});
