module.exports = Cmds.addCommand({
    cmds: [';tickets', ';gettickets', ';showtickets', ';activetickets', ';displaytickets', ';supporttickets'],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Display all open support tickets',

    args: '',

    example: '',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: async (cmd, args, msgObj, speaker, channel, guild) => {
        if (!Util.checkStaff(guild, speaker) && !Util.hasRoleName(speaker, 'Support')) {
            return Util.commandFailed(channel, speaker, 'This command can only be used by Support and above');
        }

        const activeTickets = await Data.getRecords(guild, 'tickets', { active: 1 });

        const sendEmbedFields = [];

        for (let i = 0; i < activeTickets.length; i++) {
            const record = activeTickets[i];
            const ticketNum = record.ticket_id;
            const userId = record.user_id;
            const openTick = record.open_tick;
            const description = record.description;

            const openDateStr = Util.getDateString(new Date(openTick));

            sendEmbedFields.push({ name: `Ticket #${ticketNum}`, value: `​User: <@${userId}>\nDescription: ${description}\nCreated: ${openDateStr}​`, inline: false });
        }

        Util.sendEmbed(channel, 'Open Tickets', null, Util.makeEmbedFooter(speaker), null, colBlue, sendEmbedFields);

        return true;
    },
});
