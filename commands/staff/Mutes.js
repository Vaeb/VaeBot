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

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        // var botUser = Util.getMemberById(selfId, guild);

        const nowDate = Date.now();
        const mutedGuild = Data.guildGet(guild, Data.muted);

        const sendEmbedFields = [];

        for (const [targetId, nowMute] of Object.entries(mutedGuild)) {
            const endTime = nowMute[1];
            const time = endTime - nowDate;
            console.log(time);
            const timeStr = Util.formatTime(time);
            const targUser = Util.getUserById(targetId);
            const targName = targUser == null ? nowMute[2] : Util.getMostName(targUser);
            sendEmbedFields.push({ name: targName, value: `​\nUser: <@${targetId}>\n\nReason: ${nowMute[3]}\n\nRemaining: ${timeStr}\n​`, inline: false });
        }

        Util.sendEmbed(channel, 'Active Mutes', null, Util.makeEmbedFooter(speaker), null, 0x00BCD4, sendEmbedFields);
    },
});
