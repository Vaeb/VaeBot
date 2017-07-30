module.exports = Cmds.addCommand({
    cmds: [";autoroles"],

    requires: {
        guild: true,
        loud: false
    },

    desc: "Get all autoroles (roles which users are allowed to assign to themselves)",

    args: "",

    example: "",

    ///////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        var sendEmbedFields = [];
        var guildAutoRoles = Data.guildGet(guild, Data.autoRoles);

        for (var name in guildAutoRoles) {
            if (!guildAutoRoles.hasOwnProperty(name)) continue;
            sendEmbedFields.push({name: name, value: "Role: " + guildAutoRoles[name], inline: false});
        }

        Util.sendEmbed(channel, "AutoRoles", null, Util.makeEmbedFooter(speaker), null, colGreen, sendEmbedFields);
    }
});