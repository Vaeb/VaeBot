module.exports = Cmds.addCommand({
    cmds: [';clearmutes ', ';cleanslate ', ';clearhistory '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: "Clear a user's mute history and unmute them if they are muted",

    args: '([@user] | [id] | [name])',

    example: 'vae',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        args = args.trim();

        Admin.clearMutes(guild, channel, args, speaker);
    },
});
