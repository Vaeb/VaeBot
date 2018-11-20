module.exports = Cmds.addCommand({
    cmds: [';channels'],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Get all guild channels',

    args: '',

    example: '',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        const outStr = [];
        outStr.push('**Guild text channels:**\n```');
        Util.getTextChannels(guild).forEach((tChannel) => {
            outStr.push(
                `Channel: ${tChannel.name} (${tChannel.id}) | Topic: ${tChannel.topic} | Position: ${tChannel.position} | Created: ${
                    tChannel.createdAt
                }`,
            );
        });
        outStr.push('```');
        outStr.push('**Guild voice channels:**\n```');
        Util.getVoiceChannels(guild).forEach((vChannel) => {
            outStr.push(
                `Channel: ${vChannel.name} (${vChannel.id}) | Topic: ${vChannel.topic} | Position: ${vChannel.position} | Created: ${
                    vChannel.createdAt
                } | Bitrate: ${vChannel.bitrate}`,
            );
        });
        outStr.push('```');
        Util.print(channel, outStr.join('\n'));
    },
});
