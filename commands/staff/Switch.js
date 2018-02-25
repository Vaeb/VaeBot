module.exports = Cmds.addCommand({
    cmds: [';switch'],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Specific command',

    args: '',

    example: '',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        if (guild.id === '417110408088780801' && (speaker.id === vaebId || speaker.id === '75743432164773888' || speaker.id === '87185859949899776')) {
            const salesChannel = Util.findChannel('417110408088780801', guild);
            if (salesChannel) {
                if (salesChannel.name.includes('open')) {
                    salesChannel.setName('sales_closed')
                    .catch(console.error);
                } else {
                    salesChannel.setName('sales_open')
                    .catch(console.error);
                }
            }
        }
    },
});
