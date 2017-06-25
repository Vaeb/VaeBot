module.exports = Cmds.addCommand({
    cmds: [";setautorole ", ";addautorole ", ";arole "],

    requires: {
        guild: true,
        loud: false
    },

    desc: "Set a new autorole",

    args: "([role_name]) ([auto_role_name])",

    example: "for-hire hire",

    ///////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        var data = Util.getDataFromString(args, [
            function(str, results) {
                return Util.getRole(str, guild);
            },
        ], true);
        if (!data) return Util.commandFailed(channel, speaker, "Role not found");
        var role = data[0];
        var name = data[1].toLowerCase();
        if (Util.getPosition(speaker) <= role.position) {
            Util.commandFailed(channel, speaker, "Role has equal or higher rank");
            return;
        }
        Data.guildSet(guild, Data.autoRoles, name, role.name);
        Util.print(channel, "Added the autorole", Util.fix(name), "for the", role.name, "role");
    }
});