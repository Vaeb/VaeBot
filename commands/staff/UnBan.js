module.exports = Cmds.addCommand({
    cmds: [';unban ', ';remban '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Unban a user from the guild',

    args: '([user_resolvable])',

    example: 'vae',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        guild.fetchBans().then((bans) => {
            // Collection<Snowflake, User>
            // bans = bans.map(o => o.user);
            const target = Util.searchUserPartial(bans, args);
            if (target == null) {
                Util.commandFailed(channel, speaker, 'User not found');
                return;
            }

            Admin.unBan(guild, channel, target, speaker);
        });
    },
});
