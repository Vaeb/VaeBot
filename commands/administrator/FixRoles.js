module.exports = Cmds.addCommand({
    cmds: [';fix roles'],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Fix new role permissions',

    args: '',

    example: '',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        const defRole = Util.getRole('@everyone', guild);
        const sendRole = Util.getRole('SendMessages', guild);
        const guildRoles = guild.roles;
        const defNew = {};
        const sendNew = {};

        // const newRolePerms = [
        //     'CHANGE_NICKNAME',
        //     'EMBED_LINKS',
        //     'SEND_MESSAGES',
        //     'VIEW_CHANNEL',
        //     'READ_MESSAGE_HISTORY',
        //     'ADD_REACTIONS',
        //     'USE_EXTERNAL_EMOJIS',
        //     'CONNECT',
        //     'SPEAK',
        //     'USE_VAD',
        // ];

        const newRolePerms = ['CHANGE_NICKNAME', 'SEND_MESSAGES', 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'CONNECT', 'SPEAK', 'USE_VAD'];

        const newRolePermsObj = Util.arrayToObj(newRolePerms);

        sendRole.setPermissions(newRolePerms).catch(error => Util.log(`[E_FixRoles1] ${error}`));

        guildRoles.forEach((role) => {
            if (role.id == sendRole.id) return;
            const newPerms = [];
            const rolePerms = role.serialize();
            for (const permName in rolePerms) {
                if (!rolePerms.hasOwnProperty(permName)) continue;
                if (!newRolePermsObj.hasOwnProperty(permName) && rolePerms[permName] == true) {
                    newPerms.push(permName);
                }
            }
            role.setPermissions(newPerms).catch(error => Util.log(`[E_FixRoles2] ${error}`));
        });

        /* var textChannels = Util.getTextChannels(guild);
        for (var i = 0; i < textChannels.length; i++) {
            var channel = textChannels[i];
            Util.setChannelPerms(channel, defRole, defNew);
            Util.setChannelPerms(channel, sendRole, sendNew);
        } */
    },
});
