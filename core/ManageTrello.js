const TrelloHandler = index.TrelloHandler;

const lists = {
    mutes: '59392e154996d41c2127c335',
};

exports.addCard = function (listName, cardName, cardDesc) {
    listName = listName.toLowerCase();

    if (!has.call(lists, listName)) {
        console.log(`List ${listName} does not exist`);
        return false;
    }

    cardDesc = cardDesc.substr(0, 16384);

    const listId = lists[listName];

    TrelloHandler.post('/1/cards', {
        idList: listId,
        name: cardName,
        desc: cardDesc,
        pos: 'top',
    }, (err, data) => {
        console.log('--TRELLO FEEDBACK START--');
        console.log(err);
        console.log('--<>--');
        console.log(data);
        console.log('--TRELLO FEEDBACK END--');
    });

    return true;
};
