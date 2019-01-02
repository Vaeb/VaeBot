module.exports = Cmds.addCommand({
    cmds: [';allinfo'],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Get guild, role, channel and permission info in one huge set of messages',

    args: '',

    example: '',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        const outStr = ['**Guild Info**\n```'];
        outStr.push(`Name: ${guild.name}`);
        outStr.push(`ID: ${guild.id}`);
        outStr.push(`Owner: ${Util.getName(guild.owner)} (${guild.ownerID})`);
        outStr.push(`Icon: ${guild.iconURL}`);
        outStr.push(`AFK timeout: ${guild.afkTimeout} seconds`);
        outStr.push(`Region: ${guild.region}`);
        outStr.push(`Member count: ${guild.memberCount}`);
        outStr.push(`Created: ${guild.createdAt}`);
        outStr.push(`Main channel: #${guild.defaultChannel.name}`);
        outStr.push(`Emojis: ${guild.emojis.size > 0 ? JSON.stringify(guild.emojis.array()) : 'null'}`);
        outStr.push('```');
        outStr.push('**Guild Text Channels**\n```');
        Util.getTextChannels(guild).forEach((value) => {
            outStr.push(
                `Channel: ${value.name} (${value.id}) | Topic: ${value.topic} | Position: ${value.position} | Created: ${value.createdAt}`,
            );
        });
        outStr.push('```');
        outStr.push('**Guild Voice Channels**\n```');
        Util.getVoiceChannels(guild).forEach((value) => {
            outStr.push(
                `Channel: ${value.name} (${value.id}) | Topic: ${value.topic} | Position: ${value.position} | Created: ${
                    value.createdAt
                } | Bitrate: ${value.bitrate}`,
            );
        });
        outStr.push('```');
        outStr.push('**Guild Roles**\n```');
        guild.roles.forEach((value) => {
            outStr.push(
                `Role: ${value.name} (${value.id}) | Position: ${value.position} | Mentionable: ${value.mentionable} | Color: ${
                    value.color
                }`,
            );
        });
        outStr.push('```');
        outStr.push('**Guild Permissions**\n```');
        guild.roles.forEach((value) => {
            outStr.push(`Role: ${value.name} (${value.id})`);
            outStr.push(JSON.stringify(Util.getRolePermissions(value)));
            outStr.push('');
        });
        outStr.push('');
        outStr.push('-END-');
        outStr.push('```');
        Util.print(channel, outStr.join('\n'));
    },
});
