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
        index.Translate.translate(args, 'en', (err, res) => {
            if (err) return console.log(err);

            const embFields = [
                { name: `[${res.detectedSourceLanguage}] Original`, value: res.originalText || args, inline: false },
                { name: '[en] Translation', value: res.translatedText, inline: false },
            ];

            Util.sendEmbed(channel, 'Translated', null, Util.makeEmbedFooter(speaker), null, colGreen, embFields);
        });

        return undefined;
    },

    // export GOOGLE_APPLICATION_CREDENTIALS="/home/einsteink/VaebVPS-4cce7d4f015f.json"

    // func: async (cmd, args, msgObj, speaker, channel, guild) => {
    //     const projectId = 'vaebvps';
    //     const location = 'global';

    //     const request = {
    //         parent: index.TranslateClient.locationPath(projectId, location), // projects/vaebvps/locations/global
    //         contents: [args],
    //         mimeType: 'text/plain', // mime types: text/plain, text/html
    //         targetLanguageCode: 'en-US',
    //     };

    //     const [response] = await index.TranslateClient.translateText(request);

    //     for (const translation of response.translations) {
    //         const embFields = [
    //             { name: `[${translation.detectedSourceLanguage}] Original`, value: translation.originalText || args, inline: false },
    //             { name: '[en] Translation', value: translation.translatedText, inline: false },
    //         ];

    //         Util.sendEmbed(channel, 'Translated', null, Util.makeEmbedFooter(speaker), null, colGreen, embFields);
    //     }
    // },
});
