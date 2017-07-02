module.exports = Cmds.addCommand({
    cmds: [';history', ';mutehistory'],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Get all users with mute history',

    args: '',

    example: '',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        // var botUser = Util.getMemberById(selfId, guild);

        const sendEmbedFields = [];

        const historyGuild = Data.guildGet(guild, Data.history);

        let numElements = 0;
        let numFound = 0;

        for (const targetId in historyGuild) {
            if (historyGuild.hasOwnProperty(targetId)) ++numElements;
        }

        let nowTime = Mutes.defaultMuteLength;
        let iterations = 0;

        while (numFound < numElements) {
            const nowFound = [];

            // console.log(numFound + "_" + numElements + "NOW: " + nowTime);

            for (const targetId in historyGuild) {
                if (historyGuild.hasOwnProperty(targetId)) {
                    const userName = historyGuild[targetId][1];
                    const userTime = historyGuild[targetId][0];

                    // console.log(userTime);

                    if (userTime == nowTime) {
                        ++numFound;
                        const targMention = `<@${targetId}>`;
                        nowFound.push(targMention);
                    }
                }
            }

            if (nowFound.length > 0) {
                const timeStr = Util.historyToString(nowTime);
                const nowValue = `​\n${nowFound.join('\n\n\n')}\n​`;
                sendEmbedFields.push({ name: timeStr, value: nowValue, inline: false });
            }

            nowTime *= 2;
            ++iterations;
            if (iterations > 100) {
                Util.print(channel, '[ERROR] History formatting timed out');
                return;
            }
        }

        Util.sendEmbed(channel, 'Mute History', null, Util.makeEmbedFooter(speaker), null, 0x00BCD4, sendEmbedFields);
    },
});
