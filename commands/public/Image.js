module.exports = Cmds.addCommand({
    cmds: [';img ', ';image '],

    requires: {
        guild: false,
        loud: false,
    },

    desc: 'Output an image for a word/phrase using Google',

    args: '([keyword])',

    example: 'puppy',

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        const searchStart = Util.getRandomInt(1, 20);
        const searchURL = `https://www.googleapis.com/customsearch/v1?q=${args}&num=1&start=${searchStart}&searchType=image&key=AIzaSyBNXuJaoDMdnlLFxZ20ykf68gT2Qk4eG4s&cx=003838813173771542491%3A0bxpubr42jq`;

        index.Request(searchURL, (error, response, body) => {
            if (error) {
                Util.log(`[HTTP] ${error}`);
            } else {
                try {
                    const bodyData = JSON.parse(body);
                    if (has.call(bodyData, 'items')) {
                        const imgURL = bodyData.items[0].link;
                        // Util.log(imgURL);
                        Util.print(channel, imgURL);
                        if (channel.name.toLowerCase().includes('nsfw') && !index.warnedImage[speaker.id]) {
                            index.warnedImage[speaker.id] = true;
                            Util.print(
                                channel,
                                `${speaker.toString()} is using me to post images in a nsfw channel; if the images are nsfw remember to ban them <@107593015014486016>!`,
                            );
                        }
                    } else {
                        Util.print(channel, 'No image found');
                    }
                } catch (err) {
                    Util.print(channel, 'Image search errored (invalid JSON)');
                }
            }
        });
    },
});
