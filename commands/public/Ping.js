module.exports = Cmds.addCommand({
    cmds: [';ping '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Pings a user',

    args: '([@user] | [id] | [name]) ([message])',

    example: 'vaeb fix your bot',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        const data = Util.getDataFromString(args, [
            function (str) {
                return Util.getMemberByMixed(str, guild);
            },
        ], true);
        if (!data) return Util.commandFailed(channel, speaker, 'User not found');
        // msgObj.delete();
        const user = data[0];
        const msg = data[1];
        let pingMsg = `${user.toString()} - Ping from ${Util.getName(speaker)} (${speaker.id})`;
        if (msg.length > 0) {
            pingMsg += ` - ${Util.safe(msg)}`;
        }
        Util.print(channel, pingMsg);
    },
});
