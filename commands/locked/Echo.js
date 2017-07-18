module.exports = Cmds.addCommand({
    cmds: [";echo "],

    requires: {
        guild: false,
        loud: false
    },

    desc: "Echo text into another channel",

    args: "",

    example: "",

    ///////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        var channels = client.channels;
        var data = Util.getDataFromString(args, [
            function(str, results) {
                var newChannel = channels.get(str);
                return newChannel;
            },
            function(str, results) {
                return str;
            }
        ], false);
        if (!data) return Util.commandFailed(channel, speaker, "User not found");
        //msgObj.delete();
        var newChannel = data[0];
        var msg = data[1];
        Util.log("echo'd " + msg);
        Util.print(newChannel, msg);
    }
});