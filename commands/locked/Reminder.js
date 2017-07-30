module.exports = Cmds.addCommand({
    cmds: [";reminder"],

    requires: {
        guild: false,
        loud: false
    },

    desc: "Note to self",

    args: "",

    example: "",

    ///////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        var sendEmbedFields = [];

        sendEmbedFields.push({name: "Create", value: ";create newColor newHoist newPosition newName", inline: false});
        sendEmbedFields.push({name: "Commit", value: ";commit roleName newName newColor newHoist newMentionable newPosition", inline: false});
        sendEmbedFields.push({name: "EnabR", value: ";enabr guildId roleName permEnable1 permEnable2 permEnable3", inline: false});
        sendEmbedFields.push({name: "DisabR", value: ";disabr guildId roleName permEnable1 permEnable2 permEnable3", inline: false});
        sendEmbedFields.push({name: "Set", value: ";set channelId memberId permEnable1 permEnable2 permEnable3", inline: false});
        sendEmbedFields.push({name: "Change", value: ";change channelId memberId permEnable1 permEnable2 permEnable3", inline: false});
    
    Util.sendEmbed(channel, "Reminder", null, Util.makeEmbedFooter(speaker), null, colGreen, sendEmbedFields);
    }
});