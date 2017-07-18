module.exports = Cmds.addCommand({
    cmds: [';eval ', ';run ', ';exec '],

    requires: {
        guild: false,
        loud: false,
    },

    desc: 'Execute JavaScript code',

    args: '[code]',

    example: 'return 5*2;',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        args = `(async function() {\n${args}\n})()`;
        const outStr = ['**Output:**'];
        eval(args)
        .then((result) => {
            Util.logc(`Eval result: ${result}`);
            outStr.push('```');
            outStr.push(result);
            outStr.push('```');
            if (result !== undefined) Util.print(channel, outStr.join('\n'));
        })
        .catch((err) => {
            Util.logc('Eval Error:');
            Util.logc(err);
        });
    },
});
