const TrelloHandler = index.TrelloHandler;
const DateFormat = index.DateFormat;

const boards = {
    '477270527535480834': '59392df2d36f09ca35556339', // Veil
};

const lists = {
    mutes: '59392e154996d41c2127c335',
    kicks: '59392e1330235b9cc7a28f94',
    bans: '59392e1037e46c4d8b1af98c',
};

const labels = {
    reverted: '59396434a65061821399b435',
};

const cache = {};
exports.cache = cache;

/*

    cache {
        guildId: {
            listId: {
                id: 123,
                cards: [ // Ordered from newest
                    {
                        id: 123,
                        stampCreated: 123,
                        targetId: 123,
                    }
                ]
            }
        }
    }

    -UnMute
        -Mark last card for that user as dueComplete

    -Mute
        -Mark last card for that user as dueComplete
        -Create new card

    -IncMute
        -Change due date to new date

    -UndoMute
        -Mark last card for that user as dueComplete
        -Mark last card for that user *without Reverted label* with Reverted label

*/

/*

    -Cache all lists in board
        -Cache all cards in lists

    -When a new card is added or a card is altered, alter it in cache and API

    -Get card data from cache

*/

function fixDesc(cardDesc) {
    let cardDescStr;

    if (Util.isObject(cardDesc)) {
        const cardDescNew = [];

        for (const [key, value] of Object.entries(cardDesc)) {
            if (typeof key === 'number') {
                cardDescNew.push(`${value}`);
            } else {
                cardDescNew.push(`${key}: ${value}`);
            }
        }

        cardDescStr = cardDescNew.join('\n\n');
    } else {
        cardDescStr = cardDesc;
    }

    cardDescStr = cardDescStr.substr(0, 16384);

    return cardDescStr;
}

function getTargetIdFromDesc(desc) {
    let targetId = desc.match(/User ID: (\d+)/);

    if (targetId && targetId.length > 1 && targetId[1]) {
        targetId = targetId[1];
    } else {
        targetId = null;
    }

    return targetId;
}

function getStampFromId(id) {
    return 1000 * parseInt(id.substring(0, 8), 16);
}

function sortCards(a, b) { // Newest first
    return b.stampCreated - a.stampCreated;
}

function makeCacheCard(nowCard, targetId) {
    if (targetId == null) targetId = null;

    const nowCardId = nowCard.id;

    const cacheCard = Util.cloneObj(nowCard);
    cacheCard.stampCreated = getStampFromId(nowCardId);
    cacheCard.targetId = targetId;

    return cacheCard;
}

exports.findCard = function (guild, listName, targetId, callback) {
    if (!cache[guild.id]) return false;

    listName = listName.toLowerCase();

    if (!has.call(lists, listName)) {
        Util.log(`List ${listName} does not exist`);
        return false;
    }

    const guildId = guild.id;
    const listId = lists[listName];

    const cacheCards = cache[guildId][listId].cards;

    for (let i = 0; i < cacheCards.length; i++) {
        if (cacheCards[i].targetId === targetId) {
            Util.log(`>> FOUND CARD FOR ${targetId} FROM CACHE <<`);
            callback(true, cacheCards[i]);
            return undefined;
        }
    }

    TrelloHandler.get('/1/search', {
        query: targetId,
        modelTypes: 'cards',
        card_fields: 'desc',
        cards_limit: 1,
    }, (err, data) => {
        Util.log('--[FindCard] TRELLO FEEDBACK START--');
        Util.log(err);
        Util.log('--<>--');
        Util.log(data);
        Util.log('--[FindCard] TRELLO FEEDBACK END--');

        const ok = err == null && data.cards.length > 0;

        if (ok) {
            const cardData = data.cards[0];
            const cardId = cardData.id;

            let cacheCard = null;

            for (let i = 0; i < cacheCards.length; i++) {
                if (cacheCards[i].id === cardId) {
                    cacheCard = cacheCards[i];
                    cacheCard.targetId = targetId;
                    Util.log(`>> UPDATED EXISTING TARGETID FOR ${targetId} <<`);
                    break;
                }
            }

            if (cacheCard == null) {
                cacheCard = makeCacheCard(cardData, targetId);

                cacheCards.push(cacheCard);
                cacheCards.sort(sortCards);
            }

            callback(ok, cacheCard);
        } else {
            callback(ok, err);
        }
    });

    return undefined;
};

exports.dueComplete = function (guild, cardId, callback) {
    if (!cache[guild.id]) return false;

    TrelloHandler.put(`/1/cards/${cardId}/dueComplete`, {
        value: true,
    }, (err, data) => {
        Util.log('--[DueComplete] TRELLO FEEDBACK START--');
        Util.log(err);
        Util.log('--<>--');
        Util.log(data);
        Util.log('--[DueComplete] TRELLO FEEDBACK END--');

        if (callback) callback();
    });

    return true;
};

exports.setDesc = function (guild, cardId, cardDesc) {
    if (!cache[guild.id]) return false;

    cardDesc = fixDesc(cardDesc);

    TrelloHandler.put(`/1/cards/${cardId}/desc`, {
        value: cardDesc,
    }, (err, data) => {
        Util.log('--[SetDesc] TRELLO FEEDBACK START--');
        Util.log(err);
        Util.log('--<>--');
        Util.log(data);
        Util.log('--[SetDesc] TRELLO FEEDBACK END--');
    });

    return true;
};

exports.setDue = function (guild, cardId, dueDate) {
    if (!cache[guild.id]) return false;

    TrelloHandler.put(`/1/cards/${cardId}/due`, {
        value: dueDate,
    }, (err, data) => {
        Util.log('--[SetDue] TRELLO FEEDBACK START--');
        Util.log(err);
        Util.log('--<>--');
        Util.log(data);
        Util.log('--[SetDue] TRELLO FEEDBACK END--');
    });

    return true;
};

exports.addLabel = function (guild, cardId, labelName) {
    if (!cache[guild.id]) return false;

    labelName = labelName.toLowerCase();

    if (!has.call(labels, labelName)) {
        Util.log(`Label ${labelName} does not exist`);
        return false;
    }

    const labelId = labels[labelName];

    TrelloHandler.post(`/1/cards/${cardId}/idLabels`, {
        value: labelId,
    }, (err, data) => {
        Util.log('--[AddLabel] TRELLO FEEDBACK START--');
        Util.log(err);
        Util.log('--<>--');
        Util.log(data);
        Util.log('--[AddLabel] TRELLO FEEDBACK END--');
    });

    return true;
};

exports.addCard = function (guild, listName, cardName, cardDesc, dueDate) {
    if (!cache[guild.id]) return false;

    listName = listName.toLowerCase();

    if (!has.call(lists, listName)) {
        Util.log(`List ${listName} does not exist`);
        return false;
    }

    const guildId = guild.id;
    const listId = lists[listName];

    if (dueDate == null) dueDate = null;

    const targetId = cardDesc['User ID'];

    cardDesc = fixDesc(cardDesc);

    const nowDate = new Date();
    const nowDateStr = DateFormat(nowDate, '[dd/mm/yyyy]');

    TrelloHandler.post('/1/cards', {
        idList: listId,
        name: `${nowDateStr} ${cardName}`,
        desc: cardDesc,
        pos: 'top',
        due: dueDate,
    }, (err, data) => {
        Util.log('--[AddCard] TRELLO FEEDBACK START--');
        Util.log(err);
        Util.log('--<>--');
        Util.log(data);

        Util.log('--[AddCard] TRELLO FEEDBACK END--');

        if (!err && data) {
            const cacheCards = cache[guildId][listId].cards;
            const cacheCard = makeCacheCard(data, targetId);

            cacheCards.push(cacheCard);
            cacheCards.sort(sortCards);
        }
    });

    return true;
};

exports.setupCache = function (guild) {
    const guildId = guild.id;

    if (!has.call(boards, guildId)) {
        // Util.log(`Board ${guildId} does not exist`);
        return false;
    }

    const boardId = boards[guildId];

    Util.log(`Fetching trello data for ${guild.name}`);

    TrelloHandler.get(`/1/boards/${boardId}`, {
        'lists': 'open',
        'cards': 'open',
    }, (err, data) => {
        if (err) {
            Util.log(err);
            Util.log('--<>--');
            Util.log(data);
            return;
        }

        Util.log(`Cached trello data for ${guild.name}`);

        cache[guildId] = {};

        const nowLists = data.lists;
        for (let i = 0; i < nowLists.length; i++) {
            const nowList = nowLists[i];
            const nowListId = nowList.id;

            const cacheList = Util.cloneObj(nowList);
            cacheList.cards = [];

            cache[guildId][nowListId] = cacheList;
        }

        const nowCards = data.cards;
        for (let i = 0; i < nowCards.length; i++) {
            const nowCard = nowCards[i];
            const cacheList = cache[guildId][nowCard.idList];

            const targetId = getTargetIdFromDesc(nowCard.desc);

            const cacheCard = makeCacheCard(nowCard, targetId);

            cacheList.cards.push(cacheCard);
        }

        for (const cacheListId of Object.keys(cache[guildId])) {
            const cacheList = cache[guildId][cacheListId];
            const cacheCards = cacheList.cards;
            cacheCards.sort(sortCards);
            // Util.log(cacheCards);
        }
    });

    return true;
};
