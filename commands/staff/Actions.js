module.exports = Cmds.addCommand({
    cmds: [';actions', ';guild actions', ';all actions'],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Output all actions that can be used in ;link',

    args: '',

    example: '',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel) => {
        const sendEmbedFields = [];

        for (const actionName in Events.Actions) {
            if (!has.call(Events.Actions, actionName)) continue;

            sendEmbedFields.push({ name: actionName, value: '​', inline: false });
        }

        Util.sendEmbed(channel, 'Actions', 'All actions which can be used in ;link\n​', Util.makeEmbedFooter(speaker), null, colGreen, sendEmbedFields);
    },
});
