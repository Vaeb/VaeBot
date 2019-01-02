const commands = Cmds.commands;

module.exports = Cmds.addCommand({
    cmds: [';cmds', ';commands', ';help'],

    requires: {
        guild: false,
        loud: true,
    },

    desc: 'Output all commands',

    args: '',

    example: '',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        if (Util.isLoud(channel) && !Util.checkStaff(guild, speaker)) return;

        const separator = ' OR ';

        const botUser = Util.getMemberById(selfId, guild);

        const sendEmbedFields1 = [];
        const sendEmbedFields2 = [];
        const sendEmbedFields3 = [];
        const sendEmbedFields4 = [];

        for (let i = 0; i < commands.length; i++) {
            const cmdData = commands[i];

            const cmdNames = cmdData[0];
            const cmdRequires = cmdData[2];
            const cmdDesc = cmdData[3];

            const trimCmds = [];

            for (let c = 0; c < cmdNames.length; c++) {
                trimCmds.push(cmdNames[c].trim());
            }

            const embedField = { name: trimCmds.join(separator), value: cmdDesc, inline: false };

            if (cmdRequires.vaeb) {
                sendEmbedFields1.push(embedField);
            } else if (cmdRequires.administrator) {
                sendEmbedFields4.push(embedField);
            } else if (cmdRequires.staff) {
                sendEmbedFields2.push(embedField);
            } else {
                sendEmbedFields3.push(embedField);
            }
        }

        Util.sendEmbed(channel, 'Locked Commands', null, 'Locked Commands', null, 0xf44336, sendEmbedFields1);
        Util.sendEmbed(channel, 'Administrator Commands', null, 'Administrator Commands', null, 0xffeb3b, sendEmbedFields4);
        Util.sendEmbed(channel, 'Staff Commands', null, 'Staff Commands', null, 0x4caf50, sendEmbedFields2);
        Util.sendEmbed(channel, 'Public Commands', null, 'Public Commands', null, 0x2196f3, sendEmbedFields3);
    },
});
