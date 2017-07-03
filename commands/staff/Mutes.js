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
            const nowMute = activeMutes[i];
            const targetId = nowMute.user_id;
            const endTime = nowMute.end_tick;
            const reason = nowMute.mute_reason;

            const remaining = endTime - nowDate;
            const timeStr = Util.formatTime(remaining);
            const targUser = Util.getUserById(targetId);
            const targName = targUser == null ? targetId : Util.getMostName(targUser);
            sendEmbedFields.push({ name: targName, value: `​\nUser: <@${targetId}>\n\nReason: ${reason}\n\nRemaining: ${timeStr}\n​`, inline: false });
        }

        Util.sendEmbed(channel, 'Active Mutes', null, Util.makeEmbedFooter(speaker), null, 0x00BCD4, sendEmbedFields);
    },
});
