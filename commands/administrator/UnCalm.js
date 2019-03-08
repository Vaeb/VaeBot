module.exports = Cmds.addCommand({
    cmds: [';uncalm', ';uncalmchat', ';unslow', ';unslowchat'],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Removes chat slowdown',

    args: '',

    example: '',

    // /////////////////////////////////////////////////////////////////////////////////////////

    /* func: (cmd, args, msgObj, speaker, channel, guild) => {
        if (speaker.id != guild.ownerID && speaker.id != vaebId) return Util.commandFailed(channel, speaker, "Command is owner-only");
        
        if (!index.slowChat[guild.id]) return;
        
        index.slowChat[guild.id] = null;
        index.chatQueue[guild.id] = null;
        clearInterval(index.slowInterval[guild.id]);
        index.slowInterval[guild.id] = null;
    } */

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        // if (speaker.id != guild.ownerID && speaker.id != vaebId) return Util.commandFailed(channel, speaker, "Command is owner-only");

        if (!index.slowChat[guild.id]) return;

        index.slowChat[guild.id] = null;
        index.chatNext[guild.id] = null;
    },
});
