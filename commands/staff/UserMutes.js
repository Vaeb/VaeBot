module.exports = Cmds.addCommand({
    cmds: [';mutes ', ';usermutes ', ';history ', ';userhistory '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Get the mute history of a user',

    args: '([@user] | [id] | [name])',

    example: 'vae',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: async (cmd, args, msgObj, speaker, channel, guild) => {
        const data = Util.getDataFromString(
            args,
            [
                function (str) {
                    return Util.getMemberByMixed(str, guild) || Util.isId(str);
                },
            ],
            false,
        );
        if (!data) return Util.commandFailed(channel, speaker, 'User not found');

        const member = data[0];

        let memberId = member;
        let memberName = member;

        if (typeof member === 'object') {
            memberId = member.id;
            memberName = Util.getMostName(member);
        } else {
            memberName = `<@${member}>`;
        }

        const pastMutes = await Data.getRecords(guild, 'mutes', { user_id: memberId });

        const sendEmbedFields = [];

        for (let i = 0; i < pastMutes.length; i++) {
            const record = pastMutes[i];

            const muteDate = new Date(record.start_tick);
            const muteLength = record.end_tick - record.start_tick;
            const moderatorId = record.mod_id;
            const active = record.active == 1;

            const reason = record.mute_reason;
            const muteDateStr = Util.getDateString(muteDate);
            const muteLengthStr = Util.formatTime(muteLength);
            const modMention = Util.resolveUserMention(guild, moderatorId);
            const activeStr = active ? 'Yes' : 'No';

            sendEmbedFields.push({
                name: `[${i + 1}] ${muteDateStr}`,
                value: `​Reason: ${reason}\nLength: ${muteLengthStr}\nModerator: ${modMention}\nActive: ${activeStr}`,
                inline: false,
            });
        }

        Util.sendEmbed(channel, `Mute History: ${memberName}`, null, Util.makeEmbedFooter(speaker), null, colBlue, sendEmbedFields);

        return true;
    },
});
