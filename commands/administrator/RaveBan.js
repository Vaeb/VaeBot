module.exports = Cmds.addCommand({
    cmds: [';raveban ', ';crabban ', ';crabrave ', ';rave '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Crab rave a user from the guild',

    args: '([user_resolvable) (OPTIONAL: [reason])',

    example: 'vaeb being weird',

    // /////////////////////////////////////////////////////////////////////////////////////////

    /*

        Include:
            -Server gets renamed [DONE]
            -Server icon changes
            -Channel(s) get renamed
            -Channel descriptions change
            -Spam crab rave gif
            -(TTS?) MSG: USER IS GONE [DONE]
            -Target role gets role: [MID]
                -Name: USER IS GONE [DONE]
                -Rave colours
            -Whenever they speak VaeBot sends a reply message?

    */

    func: async (cmd, args, msgObj, speaker, channel, guild) => {
        args = args.trim();

        const data = Util.getDataFromString(
            args,
            [
                function (str) {
                    return Util.getMemberByMixed(str, guild) || Util.isId(str);
                },
            ],
            true,
        );
        if (!data) return Util.commandFailed(channel, speaker, 'User not found');

        const target = data[0];
        // const reason = data[1];

        // Admin.addBan(guild, channel, target, speaker, { reason }); // Don't actually ban them for now...

        const crabRaveGif = './resources/images/CrabRaveGif.gif';

        const goneRole = guild.roles.find(r => / gone(?: \S*)?$/i.test(r.name));

        await goneRole.setName(`🦀 ${target.user.username} IS GONE 🦀`);

        target.addRole(goneRole).catch(console.error); // YOUSEEF IS GONE

        index.crabRave.goneUser = target.id;
        index.crabRave.goneGuild = guild.id;

        const intervalFunc = () => {
            channel.send(`🦀 ${target} IS GONE 🦀`, { tts: true, files: [crabRaveGif] }).catch(console.error);
        };

        index.crabRave.interval = setInterval(intervalFunc, 5000);

        channel.setName('🦀🦀🦀').catch(console.error);
        channel.setTopic(`🦀 ${target.user.username.toUpperCase()} IS GONE 🦀`).catch(console.error);

        guild.setName(`🦀 ${target.user.username.toUpperCase()} IS GONE 🦀`).catch(console.error);

        intervalFunc();

        return true;
    },
});
