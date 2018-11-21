module.exports = Cmds.addCommand({
    cmds: [';disabr '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Change even more existing somethings',

    args: '([guildId]) ([roleName]) ([permEnable1]) ([permEnable2]) ([permEnable3])',

    example: '123456789 Vaeben SEND_MESSAGES VIEW_CHANNEL',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        const data = Util.getDataFromString(
            args,
            [
                function (str, results) {
                    return client.guilds.get(str);
                },
                function (str, results) {
                    return Util.getRole(str, results[0]);
                },
            ],
            true,
        );
        if (!data) return Util.commandFailed(channel, speaker, 'Invalid parameters');
        const newGuild = data[0];
        const newRole = data[1];
        const newPerms = data[2];

        const setPerms = [];
        const pattern = /[\w_]+/g;

        let matchData;
        const allMatches = {};

        while ((matchData = pattern.exec(newPerms))) {
            const permName = matchData[0];
            if (Util.rolePermissionsObj[permName]) {
                Util.log(`Disabled ${permName} permission for ${newRole.name} role`);
                allMatches[permName] = true;
            }
        }

        for (let i = 0; i < Util.rolePermissions.length; i++) {
            const permName = Util.rolePermissions[i];
            if (newRole.hasPermission(permName) && !allMatches.hasOwnProperty(permName)) {
                setPerms.push(permName);
            }
        }

        newRole.setPermissions(setPerms).catch(error => Util.log(`[E_DisabR] ${error}`));
    },
});
