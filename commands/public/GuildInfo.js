module.exports = Cmds.addCommand({
    cmds: [';ginfo', ';guildinfo'],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Get guild info',

    args: '',

    example: '',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        const createdStr = Util.getDateString(guild.createdAt);

        const sendEmbedFields = [];

        sendEmbedFields.push({ name: 'ID', value: guild.id });
        sendEmbedFields.push({ name: 'Name', value: guild.name });
        sendEmbedFields.push({ name: 'Owner', value: guild.owner.toString() });
        sendEmbedFields.push({ name: 'Region', value: Util.capitalize(guild.region) });
        sendEmbedFields.push({ name: 'Members', value: guild.memberCount });
        sendEmbedFields.push({ name: 'Text Channels', value: Util.getTextChannels(guild).size });
        sendEmbedFields.push({ name: 'Voice Channels', value: Util.getVoiceChannels(guild).size });
        sendEmbedFields.push({ name: 'Roles', value: guild.roles.size });
        sendEmbedFields.push({ name: 'AFK Timeout', value: `${guild.afkTimeout} seconds` });
        sendEmbedFields.push({ name: 'Created', value: createdStr });
        sendEmbedFields.push({ name: 'Icon', value: guild.iconURL });

        sendEmbedFields.sort((a, b) => (String(a.name) + String(a.value)).length - (String(b.name) + String(b.value)).length);

        Util.sendEmbed(channel, 'Guild Info', null, Util.makeEmbedFooter(speaker), guild.iconURL, colGreen, sendEmbedFields);
    },
});
