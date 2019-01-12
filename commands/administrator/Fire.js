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
        if (!args || !/on|true|off|false/i.test(args)) return;

        const isOn = /on|true/i.test(args);

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
