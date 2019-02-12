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
        const target = guild.members.get(index.crabRave.goneId);

        if (target) {
            const goneRole = guild.roles.find(r => / gone(?: \S*)?$/i.test(r.name));
            target.removeRole(goneRole).catch(console.error);
        }

        index.crabRave.goneId = null;
        index.crabRave.goneName = null;
        index.crabRave.goneGuild = null;

        clearInterval(index.crabRave.interval);
        index.crabRave.interval = null;

        channel.setName('general').catch(console.error);
        channel
            .setTopic("Main channel. Avoid using bot commands here if they're getting spammy or are annoying users.")
            .catch(console.error);

        guild.setName('Vashta').catch(console.error);

        return true;
    },
});
