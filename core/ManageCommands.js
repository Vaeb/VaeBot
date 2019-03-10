exports.commands = [];

const quietChannels = {
    '477270527535480834': true,
    '289447389251502080': true,
    '285040042001432577': true,
    '284746888715042818': true,
    '294244239485829122': true,
    '290228574273798146': true,
};

function isQuiet(channel, speaker) {
    if (quietChannels[channel.id] && !Util.checkStaff(channel.guild, speaker)) {
        return true;
    }
    return false;
}

exports.addCommand = function (structure) {
    const cmds = structure.cmds;
    const fixedCmds = [];

    for (let i = 0; i < cmds.length; i++) {
        fixedCmds.push(cmds[i].toLowerCase());
    }

    const cmdData = [fixedCmds, structure.func, structure.requires, structure.desc, structure.args, structure.example];

    exports.commands.push(cmdData);
    exports.commands.sort();

    return cmdData;
};

exports.getCommand = function (contentParam) {
    let content = contentParam;

    if (content.substr(0, 5) === 'sudo ') content = content.substring(5);

    const contentLower = content.toLowerCase();

    for (let i = 0; i < exports.commands.length; i++) {
        const cmdData = exports.commands[i];
        const cmdNames = cmdData[0];

        for (let i2 = 0; i2 < cmdNames.length; i2++) {
            const cmd = cmdNames[i2];
            const cmdLength = cmd.length;
            const hasParameters = cmd[cmdLength - 1] === ' ';
            if ((hasParameters && contentLower.substr(0, cmdLength) === cmd) || (!hasParameters && contentLower === cmd)) {
                return cmdData;
            }
        }
    }

    return null;
};

exports.initCommands = function () {
    Util.bulkRequire(`${__dirname}/../commands/`);
};

exports.checkMessage = (msgObj, speaker, channel, guild, content, contentLower, authorId, isStaff) => {
    if (
        channel.id !== '168743219788644352' ||
        authorId === vaebId /* && (guild.id != "257235915498323969" || channel.id == "257244216772526092") */ ||
        authorId === '126710973737336833'
    ) {
        // script-builders
        for (let i = 0; i < exports.commands.length; i++) {
            const cmdData = exports.commands[i];
            const cmdNames = cmdData[0];
            const cmdFunc = cmdData[1];
            const cmdRequires = cmdData[2];

            for (let i2 = 0; i2 < cmdNames.length; i2++) {
                const cmd = cmdNames[i2];
                const cmdLength = cmd.length;
                const hasParameters = cmd[cmdLength - 1] === ' ';
                if ((hasParameters && contentLower.substr(0, cmdLength) === cmd) || (!hasParameters && contentLower === cmd)) {
                    if (cmdRequires.staff && !isStaff) {
                        Util.sendEmbed(
                            channel,
                            'Restricted',
                            'This command can only be used by Staff',
                            Util.makeEmbedFooter(speaker),
                            null,
                            colGreen,
                            null,
                        );
                    } else if (cmdRequires.administrator && (guild == null || !speaker.hasPermission('ADMINISTRATOR'))) {
                        Util.sendEmbed(
                            channel,
                            'Restricted',
                            'This command can only be used by Administrators',
                            Util.makeEmbedFooter(speaker),
                            null,
                            colGreen,
                            null,
                        );
                    } else if (cmdRequires.vaeb && authorId !== vaebId && authorId !== '126710973737336833') {
                        Util.sendEmbed(
                            channel,
                            'Restricted',
                            'This command can only be used by Vaeb',
                            Util.makeEmbedFooter(speaker),
                            null,
                            colGreen,
                            null,
                        );
                    } else if (cmdRequires.guild && guild == null) {
                        Util.sendEmbed(
                            channel,
                            'Restricted',
                            'This command can only be used in Guilds',
                            Util.makeEmbedFooter(speaker),
                            null,
                            colGreen,
                            null,
                        );
                    } else if (cmdRequires.loud && isQuiet(channel, speaker)) {
                        Util.sendEmbed(
                            channel,
                            'Quiet Channel',
                            'This command cannot be used in this Channel (use #bot-commands)',
                            Util.makeEmbedFooter(speaker),
                            null,
                            colGreen,
                            null,
                        );
                    } else {
                        const args = content.substring(cmdLength);
                        const argStr = args.length < 1 ? 'None' : args;
                        const guildData = guild != null ? `${guild.name} (${guild.id})` : 'NoGuild';
                        let outLog = `\n> ${Util.getName(speaker)} (${speaker.id}) | ${channel.name} (${
                            channel.id
                        }) | ${guildData}\n    Command Executed: ${cmd.trim()}`;
                        if (hasParameters) outLog += ` | Arguments: ${argStr}`;
                        Util.log(outLog);

                        if (cmdRequires.staff && guild != null) {
                            const sendLogData = [
                                'Command Entry',
                                guild,
                                speaker,
                                { name: 'Username', value: Util.resolveMention(speaker) },
                                { name: 'Channel Name', value: channel.toString() },
                                { name: 'Command Name', value: cmd },
                            ];

                            if (hasParameters) {
                                sendLogData.push({ name: 'Command Argument(s)', value: argStr });
                            } else {
                                sendLogData.push({ name: 'Command Argument(s)', value: 'N/A' });
                            }

                            Util.sendLog(sendLogData, colCommand);
                        }

                        try {
                            cmdFunc(cmd, args, msgObj, speaker, channel, guild, isStaff);
                        } catch (err) {
                            Util.log(`COMMAND ERROR: ${err.stack}`);
                        }
                    }

                    return;
                }
            }
        }
    }
};
