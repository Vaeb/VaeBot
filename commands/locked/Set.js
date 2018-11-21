module.exports = Cmds.addCommand({
    cmds: [';set '],

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
                function (str, results) {
                    return Util.findChannel(str, guild);
                },
                function (str, results) {
                    return Util.getMemberOrRoleByMixed(str, guild);
                },
                function (str, results) {
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

        for (var i = 0; i < permSplit.length; i++) {
            const keySplit = permSplit[i].split(':');
            if (keySplit.length == 2) {
                const keyUpper = keySplit[0].toUpperCase();
                const valLower = keySplit[1].toLowerCase();
                if (valLower == 'true') {
                    Util.log(`Setting ${keyUpper} to ${valLower}`);
                    permObj[keyUpper] = true;
                } else if (valLower == 'false') {
                    Util.log(`Setting ${keyUpper} to ${valLower}`);
                    permObj[keyUpper] = false;
                }
            }
        }

        for (var i = 0; i < Util.textChannelPermissions.length; i++) {
            const permName = Util.textChannelPermissions[i];
            if (!permObj.hasOwnProperty(permName)) permObj[permName] = null;
        }

        Util.setChannelPerms(newChannel, userOrRole, permObj);
    },
});
