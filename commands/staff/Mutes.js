module.exports = Cmds.addCommand({
    cmds: [';mutes', ';muted'],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Get all currently muted users',

    args: '',

    example: '',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: async (cmd, args, msgObj, speaker, channel, guild) => {
        const activeMutes = await Data.getRecords(guild, 'mutes', { active: 1 });

        const nowDate = +new Date();

        const sendEmbedFields = [];

        for (let i = 0; i < activeMutes.length; i++) {
            const muteRecord = activeMutes[i];
            const targetId = muteRecord.user_id;
            const modId = muteRecord.mod_id;
            const startTime = muteRecord.start_tick;
            const endTime = muteRecord.end_tick;
            const reason = muteRecord.mute_reason;

            const remaining = endTime - nowDate;
            const timeStr = Util.formatTime(remaining);
            // const targUser = Util.getUserById(targetId);
            // const targName = targUser == null ? targetId : Util.getMostName(targUser);
            const muteDate = new Date(startTime);
            const muteDateStr = Util.getDateString(muteDate);

            sendEmbedFields.push({ name: `[${i + 1}] ${muteDateStr}`, value: `​User: <@${targetId}>\nReason: ${reason}\nModerator: <@${modId}>\nRemaining: ${timeStr}​`, inline: false });
        }

        Util.sendEmbed(channel, 'Active Mutes', null, Util.makeEmbedFooter(speaker), null, colBlue, sendEmbedFields);
    },
});
