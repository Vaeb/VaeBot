module.exports = Cmds.addCommand({
    cmds: [';addrole '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Add a role to a user',

    args: '([@user] | [id] | [name]) ([role_name])',

    example: 'vae mod',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        const data = Util.getDataFromString(
            args,
            [
                function (str) {
                    return Util.getMemberByMixed(str, guild);
                },
                function (str) {
                    return Util.getRole(str, guild);
                },
            ],
            false,
        );

        if (!data) return Util.commandFailed(channel, speaker, 'Invalid parameters');

        const user = data[0];
        const role = data[1];

        if (role.name == 'Vashta-Owner' && !Util.isAdmin(speaker)) {
            return Util.commandFailed(channel, speaker, 'You are not allowed to add this role');
        }

        if (speaker != user && Util.getPosition(speaker) <= Util.getPosition(user)) {
            Util.commandFailed(channel, speaker, 'User has equal or higher rank');
            return false;
        }

        if (Util.getPosition(speaker) <= role.position) {
            Util.commandFailed(channel, speaker, 'Role has equal or higher rank');
            return false;
        }
        user.addRole(role).catch(console.error);

        const sendEmbedFields = [
            { name: 'Username', value: Util.getMention(user) },
            // {name: "Moderator", value: Util.getMention(speaker)},
            { name: 'Role Name', value: role.name },
        ];
        Util.sendEmbed(
            channel, // Channel Object
            'Assigned Role', // Title String
            null, // Description String
            Util.makeEmbedFooter(speaker), // Username + ID String
            Util.getAvatar(user), // Avatar URL String
            colGreen, // Color Number
            sendEmbedFields,
        );

        return true;
    },
});
