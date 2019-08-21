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
        index.translate(args, 'en', (err, res) => {
            const embFields = [
                { name: `[${res.detectedSourceLanguage}] Original`, value: res.originalText || args, inline: false },
                { name: '[en] Translation', value: res.translatedText, inline: false },
            ];
            Util.sendEmbed(channel, 'Translated', null, Util.makeEmbedFooter(speaker), null, colGreen, embFields);
        });

        return undefined;
    },
});
