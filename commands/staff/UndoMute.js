module.exports = Cmds.addCommand({
    cmds: [';undomute ', ';popmute '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: "Remove a user's last mute from their record and unmute them if they are muted",

    args: '([user_resolvable])',

    example: 'vae',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        args = args.trim();

        Admin.remMute(guild, channel, args, speaker);
    },
});
