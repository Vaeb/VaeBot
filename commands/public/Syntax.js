const commands = Cmds.commands;

module.exports = Cmds.addCommand({
    cmds: [';syntax ', ';help ', ';cmd '],

    requires: {
        guild: false,
        loud: true,
    },

    desc: 'Display command information',

    args: '',

    example: '',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        let hasFound = false;

        for (let i = 0; i < commands.length; i++) {
            const sendEmbedFields = [];
            const cmdData = commands[i];

            const fullCmds = cmdData[0];
            const trimCmds = [];
            let isMatch = false;

            for (let c = 0; c < fullCmds.length; c++) {
                const nowTrim = fullCmds[c].trim();
                trimCmds.push(nowTrim);
                if (nowTrim == args || (nowTrim.substr(0, 1) == ';' && nowTrim.substring(1) == args)) {
                    isMatch = true;
                }
            }

            if (!isMatch) continue;

            const cmdRequires = cmdData[2];
            const cmdDesc = cmdData[3];
            const cmdSyntax = cmdData[4];
            const cmdExample = cmdData[5];

            let cmdType;

            if (cmdRequires.administrator) {
                cmdType = 'Administrator';
            } else if (cmdRequires.staff) {
                cmdType = 'Staff';
            } else if (cmdRequires.vaeb) {
                cmdType = 'Vaeb';
            } else {
                cmdType = 'Public';
            }

            sendEmbedFields.push({ name: 'Commands', value: trimCmds.join(' | '), inline: false });
            sendEmbedFields.push({ name: 'Permission Level', value: cmdType, inline: false });
            sendEmbedFields.push({ name: 'Description', value: cmdDesc, inline: false });
            sendEmbedFields.push({ name: 'Syntax', value: `${trimCmds[0]} ${cmdSyntax}`, inline: false });
            sendEmbedFields.push({ name: 'Example', value: `${trimCmds[0]} ${cmdExample}`, inline: false });

            Util.sendEmbed(channel, 'Command Syntax', null, Util.makeEmbedFooter(speaker), null, colGreen, sendEmbedFields);

            hasFound = true;

            // break;
        }

        if (!hasFound) {
            Util.sendDescEmbed(channel, 'Command Syntax', 'Command not found', Util.makeEmbedFooter(speaker), null, colGreen);
        }
    },
});
