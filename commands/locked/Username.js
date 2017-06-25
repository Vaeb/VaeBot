module.exports = Cmds.addCommand({
    cmds: [";username "],

    requires: {
        guild: false,
        loud: false
    },

    desc: "Set VaeBot's username",

    args: "[username]",

    example: "VaeBot9000",

    ///////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        client.user.setUsername(args)
            .catch(console.error);
        Util.print(channel, "Set username to " + args);
    }
});