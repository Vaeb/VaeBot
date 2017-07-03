module.exports = Cmds.addCommand({
    cmds: [';history', ';mutehistory'],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Get all users with mute history',

    args: '',

    example: '',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: async (cmd, args, msgObj, speaker, channel, guild) => {
        const sendEmbedFields = [];

        const allMutes = await Data.getRecords(guild, 'mutes');

        const maxMutes = {};
        const muteHistory = {};
        const muteHistoryKeys = [];

        for (let i = 0; i < allMutes.length; i++) {
            const muteRecord = allMutes[i];
            const userId = muteRecord.user_id;
            if (!has.call(maxMutes, userId)) maxMutes[userId] = 0;
            maxMutes[userId]++;
        }

        for (const [userId, numMutes] of Object.entries(maxMutes)) {
            if (!has.call(muteHistory, numMutes)) {
                muteHistory[numMutes] = [];
                muteHistoryKeys.push(numMutes);
            }
            muteHistory[numMutes].push(`<@${userId}>`);
        }

        muteHistoryKeys.sort();

        for (let i = 0; i < muteHistoryKeys.length; i++) {
            const key = muteHistoryKeys[i];
            const keyMutes = muteHistory[key];
            sendEmbedFields.push({ name: `${key} Mutes`, value: keyMutes.join('\n'), inline: false });
        }

        Util.sendEmbed(channel, 'Mute History', null, Util.makeEmbedFooter(speaker), null, 0x00BCD4, sendEmbedFields);
    },
});
