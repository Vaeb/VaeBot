module.exports = Cmds.addCommand({
    cmds: [';alert ', ';dm ', ';announce '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Sends a DM to everyone in the guild with a certain role',

    args: '([@role] | [id] | [name]) ([message])',

    example: 'subscribers new update today',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        if (speaker.id !== guild.ownerID && speaker.id !== vaebId) return Util.commandFailed(channel, speaker, 'Command is owner-only');

        const data = Util.getDataFromString(args, [
            function (strOld) {
                let str = strOld;
                if (str[0] === '@') str = str.substring(1);
                return Util.getRole(str, guild);
            },
            function (str) {
                return str;
            },
        ], false);

        if (!data) return Util.commandFailed(channel, speaker, 'Invalid parameters');

        const role = data[0];
        const message = data[1];

        const title = `Alert | ${Util.getMostName(speaker)} | ${guild.name}`;
        const footer = Util.makeEmbedFooter(speaker);

        guild.members.forEach((member) => {
            if (!Util.hasRole(member, role) || member.id === selfId) return;
            Util.log(`Sent DM to ${Util.getFullName(member)}`);
            Util.sendDescEmbed(member, title, message, footer, null, colBlue);
        });

        return undefined;
    },
});
