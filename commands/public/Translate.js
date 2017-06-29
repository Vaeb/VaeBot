module.exports = Cmds.addCommand({
    cmds: [';translate '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Translate a word/sentence into English',

    args: '([word] | [sentence])',

    example: 'Hola mis amigos',

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        index.Translate(args, { to: 'en' }).then((res) => {
            const embFields = [
                { name: `[${res.from.language.iso}] Original`, value: res.from.text.value, inline: false },
                { name: '[en] Translation', value: res.text, inline: false },
            ];
            Util.sendEmbed(channel, 'Translated', null, Util.makeEmbedFooter(speaker), null, 0x00E676, embFields);
        })
        .catch(console.error);

        return undefined;
    },
});
