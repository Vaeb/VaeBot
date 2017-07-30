module.exports = Cmds.addCommand({
    cmds: [";queue"],

    requires: {
        guild: true,
        loud: false
    },

    desc: "List all queued songs",

    args: "",

    example: "",

    ///////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        var guildQueue = Music.guildQueue[guild.id];

        var sendEmbedFields = [];

        for (var i = 0; i < guildQueue.length; i++) {
            var songData = guildQueue[i][0];
            var author = guildQueue[i][1];
            sendEmbedFields.push({name: "[" + (i+1) + "] " + songData.title, value: "Added by " + Util.safeEveryone(author.toString()), inline: false});
        }

        Util.sendEmbed(channel, "Audio Queue", null, Util.makeEmbedFooter(speaker), null, colGreen, sendEmbedFields);
    }
});