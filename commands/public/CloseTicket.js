module.exports = Cmds.addCommand({
    cmds: [';closeticket ', ';closesupport ', ';stopticket ', ';endticket ', ';close '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Create a ticket to be viewed by Support',

    args: '([ticket_details])',

    example: 'Am I able to give away my whitelist?',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: async (cmd, args, msgObj, speaker, channel, guild) => {
        if (!Util.checkStaff(guild, speaker) && !Util.hasRoleName(speaker, 'Support')) {
            return Util.commandFailed(channel, speaker, 'This command can only be used by Support and above');
        }

        const data = Util.getDataFromString(args, [
            function (str) {
                return (str.match(/\d*(?:\.\d+)?/) || [])[0];
            },
        ], false);

        if (!data) return Util.commandFailed(channel, speaker, 'Invalid parameters');

        const numTicket = data[0];

        const foundTicket = ((await Data.getRecords(guild, 'tickets', { ticket_id: numTicket })) || [])[0];

        if (!foundTicket) return Util.commandFailed(channel, speaker, `Ticket #${numTicket} does not exist`);
        if (!foundTicket.active) return Util.commandFailed(channel, speaker, `Ticket #${numTicket} is already closed`);

        Data.updateRecords(guild, 'tickets', {
            ticket_id: numTicket,
        }, {
            active: 0,
        });

        const sendEmbedFields = [
            { name: 'Ticket User', value: `<@${foundTicket.user_id}>`, inline: false },
            { name: 'Ticket Info', value: `${foundTicket.description}`, inline: false },
            { name: 'Ticket Opened', value: Util.getDateString(new Date(foundTicket.open_tick)), inline: false },
        ];
        Util.sendEmbed(channel, `Closed Ticket #${foundTicket.ticket_id}`, null, Util.makeEmbedFooter(speaker), null, colGreen, sendEmbedFields);

        return true;
    },
});
