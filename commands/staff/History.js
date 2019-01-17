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

        const numMutesKeys = {};
        const numMutesArr = [];

        const splitMutesKeys = {};
        const splitMutesArr = [];

        for (let i = 0; i < allMutes.length; i++) {
            const record = allMutes[i];
            const userId = record.user_id;
            if (!has.call(numMutesKeys, userId)) numMutesKeys[userId] = numMutesArr.push([`<@${userId}>`, 0]) - 1;
            ++numMutesArr[numMutesKeys[userId]][1];
        }

        for (let i = 0; i < numMutesArr.length; i++) {
            const userMention = numMutesArr[i][0];
            const numMutes = numMutesArr[i][1];
            if (!has.call(splitMutesKeys, numMutes)) {
                const chunk = [];
                chunk.numMutes = numMutes;
                splitMutesKeys[numMutes] = splitMutesArr.push(chunk) - 1;
            }
            splitMutesArr[splitMutesKeys[numMutes]].push(userMention);
        }

        splitMutesArr.sort((a, b) => a.numMutes - b.numMutes);

        for (let i = 0; i < splitMutesArr.length; i++) {
            const splitMutesChunk = splitMutesArr[i];
            const numMutes = splitMutesChunk.numMutes;
            sendEmbedFields.push({ name: `${numMutes} Mute${numMutes == 1 ? '' : 's'}`, value: splitMutesChunk.join('\n'), inline: false });
        }

        Util.sendEmbed(channel, 'Mute History', null, Util.makeEmbedFooter(speaker), null, colBlue, sendEmbedFields);
    },
});

