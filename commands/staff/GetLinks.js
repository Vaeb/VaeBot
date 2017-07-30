/*

    [
        [
            eventName,
            [actionName, [actionArgs]],
            [actionName, [actionArgs]],
            [actionName, [actionArgs]]
        ],
        [
            eventName,
            [actionName, [actionArgs]],
            [actionName, [actionArgs]],
            [actionName, [actionArgs]]
        ]
    ]

*/

module.exports = Cmds.addCommand({
    cmds: [";getlinks", ";links", ";triggers"],

    requires: {
        guild: true,
        loud: false
    },

    desc: "Output all created links",

    args: "",

    example: "",

    ///////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        var guildEvents = Events.getEvents(guild);

        var sendEmbedFields = [];

        for (let i = 0; i < guildEvents.length; i++) {
            let eventData = guildEvents[i];

            let eventName = eventData[0];

            let actionStr = [];

            for (let j = 1; j < eventData.length; j++) {
                let actionData = eventData[j];
                
                let actionName = actionData[0];
                let actionArgs = actionData[1];

                actionStr.push(actionName + " " + actionArgs.join(" "));
            }

            sendEmbedFields.push({name: eventName, value: actionStr.join("\n"), inline: false});
        }

        Util.sendEmbed(channel, "Guild Links", null, Util.makeEmbedFooter(speaker), null, colGreen, sendEmbedFields);
    }
});