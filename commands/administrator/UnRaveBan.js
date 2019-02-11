module.exports = Cmds.addCommand({
    cmds: [';unraveban', ';uncrabban', ';uncrabrave', ';unrave'],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Stop the party',

    args: '',

    example: 'vaeb being weird',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        if (index.crabRave.goneUser == null) return undefined;

        const target = guild.members.get(index.crabRave.goneUser);

        if (target) {
            const goneRole = guild.roles.find(r => / gone(?: \S*)?$/i.test(r.name));
            target.removeRole(goneRole).catch(console.error);
        }

        index.crabRave.goneUser = null;

        clearInterval(index.crabRave.interval);
        index.crabRave.interval = null;

        channel.setName('general').catch(console.error);
        channel
            .setTopic("Main channel. Avoid using bot commands here if they're getting spammy or are annoying users.")
            .catch(console.error);

        return true;
    },
});
