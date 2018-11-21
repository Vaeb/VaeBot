module.exports = Cmds.addCommand({
    cmds: [';enabr ', ';setr '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Change more existing somethings',

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

        const rolePerms = newRole.serialize();

        const setPerms = [];

        const pattern = /[\w_]+/g;

        for (const permName in rolePerms) {
            if (!rolePerms.hasOwnProperty(permName)) continue;
            if (rolePerms[permName]) {
                setPerms.push(permName);
            }
        }

        let matchData;
        while ((matchData = pattern.exec(newPerms))) {
            const permName = matchData[0];
            if (Util.rolePermissionsObj[permName] && !newRole.hasPermission(permName)) {
                setPerms.push(permName);
                Util.log(`Enabled ${permName} permission for ${newRole.name} role`);
            }
        }

        Util.log(setPerms);

        newRole.setPermissions(setPerms).catch(console.error);
    },
});
