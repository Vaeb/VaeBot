module.exports = Cmds.addCommand({
    cmds: [';calm', ';calmchat', ';slow', ';slowchat'],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Slows down chat speed',

    args: '',

    example: '',

    // /////////////////////////////////////////////////////////////////////////////////////////

    /* func: (cmd, args, msgObj, speaker, channel, guild) => {
        if (speaker.id != guild.ownerID && speaker.id != vaebId) return Util.commandFailed(channel, speaker, "Command is owner-only");
        
        if (index.slowChat[guild.id]) return;

        var chatQueue = [];

        index.chatQueue[guild.id] = chatQueue;

        index.slowInterval[guild.id] = setInterval(function() {
            if (chatQueue.length < 1) return;

            var msgObj = (chatQueue.splice(0, 1))[0];

            var msgChannel = msgObj.channel;
            var msgGuild = msgObj.guild;
            var msgSpeaker = msgObj.member;
            var msgContent = msgObj.content;
            var msgCreatedAt = msgObj.createdAt;

            // Util.sendEmbed(msgChannel, Util.getMostName(msgSpeaker), msgContent, Util.makeEmbedFooter(msgSpeaker, msgCreatedAt), null, colGreen, null);
            msgChannel.send(Util.getMostName(msgSpeaker) + ": " + msgContent).catch(console.error);
        }, index.calmSpeed);

        index.slowChat[guild.id] = true;
    } */

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        // if (speaker.id != guild.ownerID && speaker.id != vaebId) return Util.commandFailed(channel, speaker, 'Command is owner-only');

        if (index.slowChat[guild.id]) return Util.log('Slow is already active');

        index.chatNext[guild.id] = +new Date() + index.calmSpeed;

        index.slowChat[guild.id] = true;

        return undefined;
    },
});
