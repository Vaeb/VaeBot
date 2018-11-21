module.exports = Cmds.addCommand({
    cmds: [';setup', ';init roles', ';initroles'],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Assign all SendMessages roles',

    args: '',

    example: '',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: async (cmd, args, msgObj, speaker, channel, guild) => {
        let sendRole = Util.getRole('SendMessages', guild);

        if (sendRole != null) {
            Util.initRoles(sendRole, guild, channel);
            return;
        }

        const newRolePerms = ['CHANGE_NICKNAME', 'SEND_MESSAGES', 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'CONNECT', 'SPEAK', 'USE_VAD'];

        try {
            sendRole = await guild.createRole({
                name: 'SendMessages',
                hoist: false,
                position: 1,
                permissions: newRolePerms,
                mentionable: false,
            });

            Util.initRoles(sendRole, guild, channel);
        } catch (err) {
            console.log('InitRolesCmd Error:', err);
        }
    },
});
