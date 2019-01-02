module.exports = Cmds.addCommand({
    cmds: [';perms '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Get guild and channel permissions for a user',

    args: '([@user] | [id] | [name])',

    example: 'vae',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        const member = Util.getMemberByMixed(args, guild);
        if (member == null) {
            Util.commandFailed(channel, speaker, 'User not found');
            return;
        }
        const guildPerms = member.permissions.serialize();
        const channelPerms = member.permissionsIn(channel).serialize();

        const guildValue = [];
        const channelValue = [];

        for (const [permName, hasPerm] of Object.entries(guildPerms)) {
            if (!hasPerm) continue;
            guildValue.push(permName);
        }

        for (const [permName, hasPerm] of Object.entries(channelPerms)) {
            if (!hasPerm) continue;
            channelValue.push(permName);
        }

        Util.sortPerms(guildValue);
        Util.sortPerms(channelValue);

        const sendEmbedFields = [
            { name: 'Guild Permissions', value: `​\n${guildValue.join('\n\n')}`, inline: false },
            { name: 'Channel Permissions', value: `​\n${channelValue.join('\n\n')}`, inline: false },
        ];

        Util.sendEmbed(channel, Util.capitalize2(`${member.displayName}'s Permissions`), null, Util.makeEmbedFooter(speaker), null, colBlue, sendEmbedFields);
    },
});
