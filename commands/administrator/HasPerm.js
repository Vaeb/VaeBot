module.exports = Cmds.addCommand({
    cmds: [";haspermission ", ";has permission ", ";hasperm ", ";has perm "],

    requires: {
        guild: true,
        loud: false
    },

    desc: "Checks guild member for permission",

    args: "([@user] | [id] | [name]) ([perm_name])",

    example: "vaeb audit log",

    ///////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        var data = Util.getDataFromString(args, [
            function(str, results) {
                return Util.getMemberByMixed(str, guild);
            },
            function(str, results) {
                return Util.strToPerm(str);
            }
        ], false);
        if (!data) return Util.commandFailed(channel, speaker, "Invalid parameters");

        var member = data[0];
        var permName = data[1];

        var hasPermGuild = member.hasPermission(permName, undefined, true, true);
        var hasPermChannel = member.permissionsIn(channel).has(permName, true);

        var sendEmbedFields = [
            {name: "Guild", value: Util.boolToAns(hasPermGuild), inline: false}
        ];

        if (Util.textChannelPermissionsObj.hasOwnProperty(permName)) {
            sendEmbedFields.push({name: "Channel", value: Util.boolToAns(hasPermChannel), inline: false});
        }

        Util.sendEmbed(channel, Util.capitalize2("Does " + member.displayName + " Have [" + permName + "] ?"), null, Util.makeEmbedFooter(speaker), null, colBlue, sendEmbedFields);
    }
});