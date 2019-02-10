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
        const guildAutoRoles = Data.guildGet(guild, Data.autoRoles);
        const props = args
            .toLowerCase()
            .trim()
            .split(' ');
        const rolesAdded = [];
        const rolesRemoved = [];

        for (let i = 0; i < props.length; i++) {
            const prop = props[i];

            if (!Object.prototype.hasOwnProperty.call(guildAutoRoles, prop)) {
                return;
            }

            const roleName = guildAutoRoles[prop];
            const roleObj = Util.getRole(roleName, guild);

            if (!Util.hasRole(speaker, roleObj)) {
                speaker.addRole(roleObj).catch(console.error);
                rolesAdded.push(roleObj.name);
            } else {
                speaker.removeRole(roleObj).catch(console.error);
                rolesRemoved.push(roleObj.name);
            }
        }

        const sendEmbedFields = [];

        if (rolesAdded.length > 0) {
            sendEmbedFields.push({ name: 'Roles Added', value: rolesAdded.join('\n') });
        }

        if (rolesRemoved.length > 0) {
            sendEmbedFields.push({ name: 'Roles Removed', value: rolesRemoved.join('\n') });
        }

        Util.sendEmbed(
            channel,
            'User Roles Altered',
            null,
            Util.makeEmbedFooter(speaker),
            Util.getAvatar(speaker),
            colGreen,
            sendEmbedFields,
        );
    },
});
