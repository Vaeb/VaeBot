const charToId = {
    a: '244832142956298240',
    b: '244832158290673664',
    c: '244832181501820928',
    d: '244832192197296128',
    e: '244832201395535873',
    f: '244832212535607296',
    g: '244832220513042432',
    h: '244832228880678913',
    i: '244832236463980545',
    j: '244832243342639106',
    k: '244832250963820545',
    l: '244832258274492416',
    m: '244832265270591489',
    n: '244832272253976577',
    o: '244832280281874433',
    p: '244832289052164096',
    q: '244832298552262657',
    r: '244832306878087169',
    s: '244832315174420480',
    t: '244832323529342976',
    u: '244832374343335936',
    v: '244832383998754818',
    w: '244832392873771019',
    x: '244832402856214543',
    y: '244832411366588416',
    z: '244832419079782400',
};

module.exports = Cmds.addCommand({
    cmds: [';txt ', ';text ', ';type '],

    requires: {
        guild: false,
        loud: false,
    },

    desc: 'Echo your text with emojis',

    args: '([message])',

    example: 'hello there',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        const argsLower = args.toLowerCase();

        for (let i = 0; i < index.bannedLetters.length; i++) {
            if (argsLower.includes(index.bannedLetters[i].toLowerCase())) {
                Util.print(channel, 'Nope: The letter `F` is now banned.');
                return;
            }
        }

        let str = '';
        let wasChar = false;
        for (let i = 0; i < args.length; i++) {
            let char = args[i];
            const charl = char.toLowerCase();
            if (charToId.hasOwnProperty(charl)) {
                char = `<:${charl}_:${charToId[charl]}>`;
                if (wasChar) {
                    char = ` ${char}`;
                    wasChar = false;
                }
            } else {
                wasChar = true;
            }
            str += char;
        }
        // str = str.replace(/@/g, "@​");
        str = Util.safe(str);
        Util.print(channel, str);
    },
});
