module.exports = Cmds.addCommand({
    cmds: [';unlink ', ';remlink ', ';dellink ', ';untrigger ', ';unevent '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'UnLink an event from an action',

    args: '({ [event_name_1] ... [event_name_n] }) ({ [action_1_name] }) ... ({ [action_o_name] })',
    // args: "([event_name_1] ... [event_name_n]) (-[action_1_name] [action_1_param_1] ... [action_param_n]) ... (-[action_n_name] [action_n_param_1] ... [action_n_param_o])",

    example: '{ UserJoin UserUnMute } { AddRole } { DM }',
    // example: "UserJoin UserUnMute -AddRole SendMessages RandomRole -DM CmdInfo",

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        let event = null;
        const actions = [];

        let numOpen = 0;
        let lastOpen = 0;

        for (let i = 0; i < args.length; i++) {
            const char = args[i];

            if (char == '{') {
                if (numOpen == 0) {
                    lastOpen = i;
                }

                numOpen++;
            } else if (char == '}') {
                numOpen--;

                if (numOpen == 0) {
                    const paramStr = args.substring(lastOpen + 1, i);

                    if (event == null) {
                        event = paramStr.trim().split(' ');
                    } else {
                        actions.push(paramStr.trim().split(' '));
                    }
                }
            }
        }

        if (event == null || event.length == 0) {
            return Util.commandFailed(channel, speaker, 'Invalid parameters: Event not provided');
        }

        Util.log(event);
        Util.log(actions);

        for (let i = 0; i < event.length; i++) {
            const eventName = event[i];

            const sendEmbedFields = [];

            sendEmbedFields.push({ name: 'Event', value: eventName, inline: false });

            if (actions.length == 0) {
                Events.remEvent(guild, eventName);
            } else {
                for (let j = 0; j < actions.length; j++) {
                    const actionData = actions[i];
                    const actionName = actionData[0];

                    Events.remEvent(guild, eventName, actionName);

                    sendEmbedFields.push({ name: 'Action', value: actionName, inline: false });
                }
            }

            Util.sendEmbed(channel, 'Removed Link', null, Util.makeEmbedFooter(speaker), null, colGreen, sendEmbedFields);
        }
    },
});
