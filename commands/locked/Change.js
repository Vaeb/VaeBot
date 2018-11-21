module.exports = Cmds.addCommand({
    cmds: [';changeperms '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Change an existing something',

    args: '([channelId]) ([memberOrRoleId]) ([permEnable1]) ([permEnable2]) ([permEnable3])',

    example: '123456789 987654321 SEND_MESSAGES VIEW_CHANNEL',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        const data = Util.getDataFromString(
            args,
            [
                function (str) {
                    return Util.findChannel(str, guild);
                },
                function (str) {
                    return Util.getMemberOrRoleByMixed(str, guild);
                },
                function (str) {
                    return str;
                },
            ],
            false,
        );
        if (!data) return Util.commandFailed(channel, speaker, 'Invalid parameters');

        const newChannel = data[0];
        const userOrRole = data[1];
        const permStr = data[2];

        const permSplit = permStr.split(' ');
        const permObj = {};

        for (let i = 0; i < permSplit.length; i++) {
            const keySplit = permSplit[i].split(':');
            if (keySplit.length == 2) {
                const keyUpper = keySplit[0].toUpperCase();
                const valLower = keySplit[1].toLowerCase();
                if (valLower == 'true') {
                    Util.log(`Changing ${keyUpper} to ${valLower}`);
                    permObj[keyUpper] = true;
                } else if (valLower == 'false') {
                    Util.log(`Changing ${keyUpper} to ${valLower}`);
                    permObj[keyUpper] = false;
                }
            }
        }

        Util.setChannelPerms(newChannel, userOrRole, permObj);

        return true;
    },
});
