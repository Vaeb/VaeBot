module.exports = Cmds.addCommand({
    cmds: [";roles"],

    requires: {
        guild: true,
        loud: false
    },

    desc: "Get all guild roles",

    args: "",

    example: "",

    ///////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        var sendEmbedFields = [];
        var guildRoles = Util.getGuildRoles(guild);

        for (var i = 0; i < guildRoles.length; i++) {
            var nowRole = guildRoles[i];
            sendEmbedFields.push({name: nowRole.name, value: "Position: " + nowRole.position + " | Mentionable: " + nowRole.mentionable  + " | Color: " + nowRole.color, inline: false});
        }

        Util.sendEmbed(channel, "Guild Roles", null, Util.makeEmbedFooter(speaker), null, colGreen, sendEmbedFields);
    }
});