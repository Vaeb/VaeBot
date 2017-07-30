module.exports = Cmds.addCommand({
    cmds: [";events", ";guild events", ";all events"],

    requires: {
        guild: true,
        loud: false
    },

    desc: "Output all events that can be used in ;link",

    args: "",

    example: "",

    ///////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        var sendEmbedFields = [];

        sendEmbedFields.push({name: "MessageCreate", value: "​", inline: false});
        sendEmbedFields.push({name: "MessageDelete", value: "​", inline: false});
        sendEmbedFields.push({name: "UserJoin", value: "​", inline: false});
        sendEmbedFields.push({name: "UserLeave", value: "​", inline: false});
        sendEmbedFields.push({name: "UserMute", value: "​", inline: false});
        sendEmbedFields.push({name: "UserUnMute", value: "​", inline: false});
        sendEmbedFields.push({name: "UserUnMute", value: "​", inline: false});
        sendEmbedFields.push({name: "UserRoleAdd", value: "​", inline: false});
        sendEmbedFields.push({name: "UserRoleRemove", value: "​", inline: false});
        sendEmbedFields.push({name: "UserNicknameUpdate", value: "​", inline: false});

        Util.sendEmbed(channel, "Events", "All events which can be used in ;link\n​", Util.makeEmbedFooter(speaker), null, colGreen, sendEmbedFields);
    }
});