module.exports = Cmds.addCommand({
    cmds: [';fire '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Set fire to the server',

    args: '(on | off)',

    example: 'on',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        console.log(args, args[0]);

        if (!args[0] || !/on|true|off|false/i.test(args[0])) return;

        const isOn = /on|true/i.test(args[0]);

        if (isOn) {
            guild.channels.forEach((c) => {
                if (!c.name.endsWith('🔥')) c.setName(`${c.name}🔥`);
            });
        } else {
            guild.channels.forEach((c) => {
                if (c.name.endsWith('🔥')) c.setName(c.name.substr(0, c.name.length - 1));
            });
        }
    },
});
