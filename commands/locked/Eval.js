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
        const print = (...args2) => Util.print(channel, ...args2);
        args = `(async function() {\n${args}\n})()`;
        const outStr = ['**Output:**'];
        eval(args)
            .then((result) => {
                Util.log('Eval result:', result);
                outStr.push('```');
                outStr.push(Util.format(result));
                outStr.push('```');
                if (result !== undefined) Util.print(channel, outStr.join('\n'));
            })
            .catch((err) => {
                Util.log('Eval Error:');
                Util.log(err);
            });
    },
});
