const TrelloHandler = index.TrelloHandler;
const DateFormat = index.DateFormat;

const lists = {
    mutes: '59392e154996d41c2127c335',
    kicks: '59392e1330235b9cc7a28f94',
    bans: '59392e1037e46c4d8b1af98c',
};

/*

    -UnMute
        -Mark last card for that user as dueComplete

    -Mute
        -Mark last card for that user as dueComplete
        -Create new card

    -IncMute
        -Change due date to new date

*/

exports.findCard = function (targetId, callback) {
    TrelloHandler.get('/1/search', {
        query: targetId,
        modelTypes: 'cards',
        card_fields: 'desc',
        cards_limit: 1,
    }, (err, data) => {
        console.log('--TRELLO FEEDBACK START--');
        console.log(err);
        console.log('--<>--');
        console.log(data);
        console.log('--TRELLO FEEDBACK END--');

        if (err) return;

        callback(data.cards[0]);
    });
};

exports.dueComplete = function (cardId) {
    TrelloHandler.put(`/1/cards/${cardId}/dueComplete`, {
        value: true,
    }, (err, data) => {
        console.log('--TRELLO FEEDBACK START--');
        console.log(err);
        console.log('--<>--');
        console.log(data);
        console.log('--TRELLO FEEDBACK END--');
    });
};

exports.addCard = function (listName, cardName, cardDesc, dueDate) {
    listName = listName.toLowerCase();

    if (dueDate == null) dueDate = null;

    if (!has.call(lists, listName)) {
        console.log(`List ${listName} does not exist`);
        return false;
    }

    if (Util.isObject(cardDesc)) {
        const cardDescNew = [];

        for (const [key, value] of Object.entries(cardDesc)) {
            if (typeof key === 'number') {
                cardDescNew.push(`${value}`);
            } else {
                cardDescNew.push(`${key}: ${value}`);
            }
        }

        cardDesc = cardDescNew.join('\n\n');
    }

    cardDesc = cardDesc.substr(0, 16384);

    const listId = lists[listName];
    const nowDate = new Date();
    const nowDateStr = DateFormat(nowDate, '[dd/mm/yyyy]');

    TrelloHandler.post('/1/cards', {
        idList: listId,
        name: `${nowDateStr} ${cardName}`,
        desc: cardDesc,
        pos: 'top',
        due: dueDate,
    }, (err, data) => {
        console.log('--TRELLO FEEDBACK START--');
        console.log(err);
        console.log('--<>--');
        console.log(data);
        console.log('--TRELLO FEEDBACK END--');
    });

    return true;
};
