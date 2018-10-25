module.exports = Cmds.addCommand({
    cmds: [';raidmode', ';start raidmode', ';enable raidmode'],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Activate raid mode',

    args: '',

    example: '',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        if (index.raidMode[guild.id]) {
            Util.log('Raid mode is already active');
            Util.print(channel, 'Raid mode is already active');
            return;
        }

        index.activateRaidMode(guild);

        Util.log('Raid mode enabled');
        Util.print(channel, 'Raid mode activated');
    },
});
