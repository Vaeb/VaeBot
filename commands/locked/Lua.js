module.exports = Cmds.addCommand({
    cmds: [";lua "],

    requires: {
        guild: false,
        loud: false
    },

    desc: "Execute Lua code",

    args: "[code]",

    example: "print(\"Hello, world!\")",

    ///////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        if (args.substr(0, 3) == "-h ") {
            var url = args.substring(3);
            index.Request(url, function(error, response, body) {
                if (error) {
                    Util.print(channel, "[HTTP]", error);
                } else {
                    Util.runLua(body, channel);
                }
            });
        } else {
            Util.runLua(args, channel);
        }
    }
});