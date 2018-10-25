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

        const joinStamp = +new Date();

        index.recentMembers = index.recentMembers.filter(memberData => joinStamp - memberData.joinStamp < index.newMemberTime);
        index.recentMembers2 = index.recentMembers2.filter(memberData => joinStamp - memberData.joinStamp < index.newMemberTime2);
        index.activateRaidMode(guild, channel);
    },
});
