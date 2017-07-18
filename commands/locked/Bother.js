module.exports = Cmds.addCommand({
    cmds: [';bother '],

    requires: {
        guild: false,
        loud: false,
    },

    desc: 'Hi friend',

    args: '([@user] | [id] | [name])',

    example: 'vae',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        const target = Util.getEitherByMixed(args, guild);

        if (target == null) return Util.commandFailed(channel, speaker, 'User not found');

        const targName = Util.getName(target);

        Util.print(channel, 'Bothering', targName);

        let n = 0;

        const interval = setInterval(() => {
            if (n > 50) {
                clearInterval(interval);
                return;
            }

            let sendStr = [];

            while (true) {
                let rand = String(Math.random());
                const dotPos = rand.indexOf('.');
                if (dotPos) rand = rand.substring(dotPos + 1);
                const subStr = 'HI FRIEND!';
                if ((sendStr.join('\n') + '\n' + subStr).length >= 2000) break;
                sendStr.push(subStr);
            }

            sendStr = sendStr.join('\n');

            try {
                Util.print(target, sendStr);
            } catch (err) {
                Util.log(`BOTHER ERROR: ${err}`);
            }
            n += 1;
        }, 50);

        return undefined;
    },
});
