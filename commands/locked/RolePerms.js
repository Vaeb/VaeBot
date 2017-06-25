module.exports = Cmds.addCommand({
    cmds: [";roleperms", ";rolepermissions", ";gperms"],

    requires: {
        guild: true,
        loud: false
    },

    desc: "Get all role permissions",

    args: "",

    example: "",

    ///////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        var outStr = [];
        outStr.push("**Guild permissions:**\n```");
        guild.roles.forEach(function(value, index, self) {
            outStr.push("Role: " + value.name + " (" + value.id + ")");
            outStr.push(JSON.stringify(value.serialize()));
            outStr.push("");
        });
        outStr.push("```");
        Util.print(channel, outStr.join("\n"));
    }
});