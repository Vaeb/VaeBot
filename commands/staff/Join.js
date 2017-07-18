module.exports = Cmds.addCommand({
    cmds: [";join ", ";summon "],

    requires: {
        guild: true,
        loud: false
    },

    desc: "Make VaeBot join a voice channel",

    args: "([voice_channel_name])",

    example: "gaming",

    ///////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        var vChannel = Util.getVoiceChannels(guild).find(channel => args == "<#" + channel.id + ">" || channel.name.toLowerCase().indexOf(args.toLowerCase()) >= 0);
        if (vChannel) {
            vChannel.join()
            .then(connection => Util.print(channel, "Joined", vChannel.name))
            .catch(error => Util.log("[E_JoinCmd] addRole: " + error));
        } else {
            Util.print(channel, "Voice channel not found");
        }
    }
});