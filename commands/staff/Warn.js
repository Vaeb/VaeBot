module.exports = Cmds.addCommand({
    cmds: [';warn ', ';warnhammer '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Warns a user and puts the warning on their record',

    args: '([@user] | [id] | [name]) (OPT: [reason])',

    example: 'vae spamming the chat',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        args = args.trim();

        const data = Util.getDataFromString(args,
            [
                [
                    function (str) {
                        return Util.getMemberByMixed(str, guild) || Util.isId(str);
                    },
                ],
            ]
        , true);

        if (!data) {
            return Util.sendEmbed(channel, 'Warn Failed', 'User not found', Util.makeEmbedFooter(speaker), null, colGreen, null);
        }

        Util.log(`Change Arg Data: ${data}`);

        const member = data[0];
        const reason = data[1];

        Admin.addWarning(guild, channel, member, speaker, reason);

        return true;
    },
});
