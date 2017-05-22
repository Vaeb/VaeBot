module.exports = Cmds.addCommand({
    cmds: [';toggle '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Toggle an autorole on the speaker',

    args: '([auto_role_name_1] .. [auto_role_name_n])',

    example: 'hire',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        const props = args.toLowerCase();
        const guildAutoRoles = Data.guildGet(guild, Data.autoRoles);
        props.split(' ').forEach((prop) => {
            if (!Object.prototype.hasOwnProperty.call(guildAutoRoles, prop)) {
                Util.commandFailed(channel, speaker, 'AutoRole not found');
                return;
            }
            const roleName = guildAutoRoles[prop];
            const roleObj = Util.getRole(roleName, guild);
            if (!Util.hasRole(speaker, roleObj)) {
                speaker.addRole(roleObj);
                const sendEmbedFields = [
                    { name: 'Role Name', value: roleObj.name },
                ];
                Util.sendEmbed(channel, 'AutoRole Added', null, Util.makeEmbedFooter(speaker), Util.getAvatar(speaker), 0x00E676, sendEmbedFields);
            } else {
                speaker.removeRole(roleObj);
                const sendEmbedFields = [
                    { name: 'Role Name', value: roleObj.name },
                ];
                Util.sendEmbed(channel, 'AutoRole Removed', null, Util.makeEmbedFooter(speaker), Util.getAvatar(speaker), 0x00E676, sendEmbedFields);
            }
        });
    },
});
