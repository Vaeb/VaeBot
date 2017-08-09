module.exports = Cmds.addCommand({
    cmds: [';offenses', ';badoffenses', ';listoffenses', ';rules'],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Output the list of offenses with defined mute times',

    args: '',

    example: '',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: async (cmd, args, msgObj, speaker, channel, guild) => {
        const sendEmbedFields = [];

        for (let i = 0; i < Admin.badOffenses.length; i++) {
            const offenseData = Admin.badOffenses[i];

            const offenseStr = offenseData.offense;
            const timeStr = Util.formatTime(offenseData.time);

            sendEmbedFields.push({ name: `Tag: [${i}]`, value: `Offense: ${offenseStr}\nDefined Time: ${timeStr}​`, inline: false });
        }

        Util.sendEmbed(channel, 'Bad Offenses', 'If a user commits an offense listed here, their maximum mute time is whichever is larger: The defined time for the offense or their next default mute time.\n\nPut an offense tag at the start of a mute reason to tag it as that offense.', Util.makeEmbedFooter(speaker), null, colBlue, sendEmbedFields);
    },
});
