module.exports = Cmds.addCommand({
    cmds: [";remautorole ", ";delautorole ", "aroledel "],

    requires: {
        guild: true,
        loud: false
    },

    desc: "Remove an autorole",

    args: "([auto_role_name])",

    example: "hire",

    ///////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        var prop = args.toLowerCase();
        var guildAutoRoles = Data.guildGet(guild, Data.autoRoles);
        if (!guildAutoRoles.hasOwnProperty(prop)) {
            Util.commandFailed(channel, speaker, "AutoRole not found");
            return;
        }
        Data.guildDelete(guild, Data.autoRoles, prop);
        saveAutoRoles();
        Util.print(channel, "Removed the", Util.fix(prop), "autorole");
    }
});
