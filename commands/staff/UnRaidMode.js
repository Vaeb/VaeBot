module.exports = Cmds.addCommand({
    cmds: [';unraidmode', ';stopraidmode', ';stop raidmode', ';disable raidmode'],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Disable raid mode',

    args: '',

    example: '',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        if (!index.raidMode[guild.id]) {
            Util.log('Raid mode is already disabled');
            Util.print(channel, 'Raid mode is already disabled');
            return;
        }

        index.disableRaidMode(guild, channel);
    },
});
