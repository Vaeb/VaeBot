module.exports = Cmds.addCommand({
    cmds: [";power ", ";rank ", ";rate "],

    requires: {
        guild: true,
        loud: false
    },

    desc: "Are you over 9000?!",

    args: "([@user] | [id] | [name])",

    example: "vae",

    ///////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        var target = Util.getMemberByMixed(args, guild);
        if (target == null) return Util.commandFailed(channel, speaker, "User not found");

        var highestRole = Util.getHighestRole(target);
        var powerRating = Util.toFixedCut(Util.getPermRating(guild, target), 3) + "%";

        var sendEmbedFields = [];

        sendEmbedFields.push({name: "Username", value: target.toString()});
        sendEmbedFields.push({name: "Staff", value: Util.capitalize(Util.checkStaff(guild, target))});
        sendEmbedFields.push({name: "Rank", value: highestRole.name + " (" + highestRole.position + ")"});
        sendEmbedFields.push({name: "Power", value: powerRating});

        Util.sendEmbed(channel, "User Power Ranking", null, Util.makeEmbedFooter(speaker), Util.getAvatar(target), colGreen, sendEmbedFields);
    }
});