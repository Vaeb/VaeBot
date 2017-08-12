const checkFuncs = {
    user: ((msgObj, userId) => msgObj.author.id === userId),

    regex: ((msgObj, regexObj) => regexObj.test(msgObj.content)),

    all: (() => true),

    cmd: (msgObj => msgObj.author.id === selfId || Cmds.getCommand(msgObj.content) != null),

    bot: (msgObj => msgObj.author.bot === true),

    hook: (msgObj => msgObj.author.bot === true),

    image: ((msgObj) => {
        const embeds = msgObj.embeds || [];
        const attachments = msgObj.attachments || [];

        for (let i = 0; i < embeds.length; i++) {
            const nowEmbed = embeds[i];
            if (nowEmbed.type === 'image' || nowEmbed.type === 'gifv' || nowEmbed.type === 'gif' || nowEmbed.type === 'webm') {
                return true;
            }
        }

        for (let i = 0; i < attachments.length; i++) {
            const nowAtt = attachments[i];
            if (has.call(nowAtt, 'width')) {
                return true;
            }
        }

        return false;
    }),

    file: ((msgObj) => {
        const attachments = msgObj.attachments != null ? msgObj.attachments : [];

        for (let i = 0; i < attachments.length; i++) {
            const nowAtt = attachments[i];
            if (!has.call(nowAtt, 'width')) {
                return true;
            }
        }

        return false;
    }),

    link: ((msgObj) => {
        if (Util.checkURLs(msgObj.content).length > 0) return true;

        const embeds = msgObj.embeds != null ? msgObj.embeds : [];

        for (let i = 0; i < embeds.length; i++) {
            const nowEmbed = embeds[i];
            if (nowEmbed.type === 'link') {
                return true;
            }
        }

        return false;
    }),

    mention: ((msgObj) => {
        const mentions = msgObj.mentions;

        return mentions.length > 0;
    }),
};

module.exports = Cmds.addCommand({
    cmds: [';clear ', ';clean ', ';wipe ', ';clearchats ', ';cleanchats '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Delete the last <1-1000> messages matching a [user | regex-pattern | message-type] in the channel',

    args: '([userResolvable] | [/regex/] | [all | bots | hooks | images | files | links | mentions]) (<1-1000>)',

    example: 'vaeb 30',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: async (cmd, args, msgObj, speaker, channel, guild) => {
        const data = Util.getDataFromString(args, [
            function (str) {
                let lower = str.toLowerCase();
                if (lower.substring(lower.length - 1) === 's') lower = lower.substr(0, lower.length - 1);
                // types
                if (lower === 'all' || lower === 'cmd' || lower === 'bot' || lower === 'hook' || lower === 'image' || lower === 'file' || lower === 'link' || lower === 'mention') {
                    return [lower];
                }
                // regex
                const regMatch = /^\/(.+)\/$/.exec(str);
                if (regMatch) return ['regex', regMatch[1]];
                // member
                const member = Util.getMemberByMixed(str, guild);
                if (member) return ['member', member];
                // user id
                const userId = Util.isId(str);
                if (userId) return ['id', userId];
                return undefined;
            },
            function (str) {
                let numArgs = Number(str);
                if (!isNaN(numArgs) && numArgs >= 1) {
                    numArgs = Util.round(numArgs, 1);
                    numArgs = Math.min(numArgs, 1000);
                    return numArgs;
                }
                return undefined;
            },
        ], true);
        if (!data) {
            return Util.commandFailed(channel, speaker, 'Invalid parameters');
        }

        const matchData = data[0];
        let numArgs = data[1];
        // const scope = data[2];
        const matchType = matchData[0];
        const matchVal = matchData[1];

        let funcData;
        if (matchType === 'member') {
            funcData = matchVal.id;
        } else if (matchType === 'id') {
            funcData = matchVal;
        } else if (matchType === 'regex') {
            funcData = new RegExp(matchVal, 'gim');
        }

        let includeSelf = false;

        if (matchType === 'all' || funcData === speaker.id) {
            includeSelf = true;
            numArgs++;
        }

        let checkFunc;

        if (matchType === 'member' || matchType === 'id') {
            checkFunc = checkFuncs.user;
        } else {
            checkFunc = checkFuncs[matchType];
        }

        let numSearch = matchType !== 'all' ? numArgs * 30 : numArgs;
        numSearch = Math.min(numSearch, 1000);

        let last = null;
        if (matchType === 'cmd') {
            last = msgObj;
            numArgs *= 2;
        }

        const msgStore = [];

        // +++++++++++++++++++++ MESSAGE SCANNING +++++++++++++++++++++

        await Util.fetchMessagesEx(channel, numSearch, msgStore, last);
        Util.log(`Messages checked: ${msgStore.length}`);

        const msgStoreUser = [];
        for (let i = 0; i < msgStore.length; i++) {
            const nowMsgObj = msgStore[i];
            if ((includeSelf || nowMsgObj.id !== msgObj.id) && checkFunc(nowMsgObj, funcData)) {
                msgStoreUser.push(nowMsgObj);
                if (msgStoreUser.length >= numArgs) break;
            }
        }

        const storeLength = msgStoreUser.length;
        const chunkLength = 99;
        Util.log(`Matches found: ${msgStoreUser.length}`);

        for (let i = 0; i < storeLength; i += chunkLength) {
            const chunk = msgStoreUser.slice(i, i + chunkLength);

            if (chunk.length > 1) {
                channel.bulkDelete(chunk)
                    .then(() => Util.log(`Cleared ${chunk.length} messages`))
                    .catch(Util.logErr);
            } else {
                chunk[0].delete()
                    .then(() => Util.log('Cleared 1 message'))
                    .catch(Util.logErr);
            }
        }

        return undefined;
    },
});
