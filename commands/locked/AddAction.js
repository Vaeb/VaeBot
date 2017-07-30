module.exports = Cmds.addCommand({
    cmds: [';addaction ', ';linkaction ', ';createaction ', ';action '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Creates an action to be used in ;link',

    args: '',

    example: 'EchoMessage (guild, eventName, actionArgs, eventArgs) => { Util.print(channel, ...eventArgs[3]) };',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel) => {
        const spaceIndex = args.indexOf(' ');
        if (spaceIndex == -1) return Util.commandFailed(channel, speaker, 'Invalid parameters');

        const actionName = args.substring(0, spaceIndex);
        const actionFuncStr = args.substring(spaceIndex + 1);

        const evalStr = `Events.Actions.${actionName} = ${actionFuncStr}`;

        Util.log(evalStr);

        eval(evalStr);

        Util.sendDescEmbed(channel, 'Added Action', `Added action ${actionName} for linking`, Util.makeEmbedFooter(speaker), null, colGreen);

        return true;
    },
});
