module.exports = Cmds.addCommand({
    cmds: [";nick ", ";nickname "],

    requires: {
        guild: true,
        loud: false
    },

    desc: "Set a user's nickname",

    args: "([@user] | [id] | [name]) ([new_nickname])",

    example: "vae vaeben",

    ///////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        var data = Util.getDataFromString(args, [
            function(str, results) {
                return Util.getMemberByMixed(str, guild);
            }
        ], true);

        if (!data) return Util.commandFailed(channel, speaker, "Invalid parameters");

        var member = data[0];
        var nick = data[1];

        if ((member.id == vaebId || member.id == selfId) && speaker.id != vaebId) {
            Util.commandFailed(channel, speaker, "You are not allowed to set developer nicknames");
            return;
        }

        if (Util.getPosition(speaker) <= Util.getPosition(member) && member != speaker) {
            Util.commandFailed(channel, speaker, "User has equal or higher rank");
            return;
        }

        var previousNick = member.nickname;

        member.setNickname(nick);

        var sendEmbedFields = [
            {name: "Username", value: member.toString()},
            {name: "Old Nickname", value: previousNick},
            {name: "New Nickname", value: nick}
        ];

        Util.sendEmbed(channel, "Nickname Updated", null, Util.makeEmbedFooter(speaker), Util.getAvatar(member), colGreen, sendEmbedFields);

        var sendLogData = [
            "Set Nickname",
            guild,
            member,
            {name: "Username", value: member.toString()},
            {name: "Moderator", value: speaker.toString()},
            {name: "Nickname", value: nick}
        ];

        Util.sendLog(sendLogData, colAction);
    }
});