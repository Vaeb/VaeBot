exports.commands = [];

const quietChannels = {
	"284746138995785729": true,
	"289447389251502080": true,
	"285040042001432577": true,
	"284746888715042818": true,
	"294244239485829122": true,
	"290228574273798146": true
};

function isQuiet(channel, speaker) {
	if (quietChannels[channel.id] && !Util.checkStaff(channel.guild, speaker)) {
		return true;
	}
	return false;
}

exports.addCommand = function(structure) {
	var cmds = structure.cmds;
	var fixedCmds = [];

	for (var i = 0; i < cmds.length; i++) {
		fixedCmds.push(cmds[i].toLowerCase());
	}

	var cmdData = [fixedCmds, structure.func, structure.requires, structure.desc, structure.args, structure.example];

	exports.commands.push(cmdData);
	exports.commands.sort();

	return cmdData;
};

exports.initCommands = function() {
	Util.bulkRequire("./commands/");
};

exports.checkMessage = (msgObj, speaker, channel, guild, content, lcontent, authorId, isStaff) => {
	if ((channel.id != "168743219788644352" || authorId == vaebId)/* && (guild.id != "257235915498323969" || channel.id == "257244216772526092")*/) { //script-builders
		for (var i = 0; i < exports.commands.length; i++) {

			var holder = exports.commands[i];
			var cmds = holder[0];
			var func = holder[1];
			var requires = holder[2];

			for (var i2 = 0; i2 < cmds.length; i2++) {

				var cmd = cmds[i2];
				var length = cmd.length;
				var hasParameters = cmd[length-1] == " ";
				if (hasParameters && lcontent.substr(0, length) == cmd || !hasParameters && lcontent == cmd) {

					if (requires.staff && !isStaff) {
						Util.sendEmbed(channel, "Restricted", "This command can only be used by Staff", Util.makeEmbedFooter(speaker), null, 0x00E676, null);
					} else if (requires.vaeb && authorId != vaebId) {
						Util.sendEmbed(channel, "Restricted", "This command can only be used by Vaeb", Util.makeEmbedFooter(speaker), null, 0x00E676, null);
					} else if (requires.guild && guild == null) {
						Util.sendEmbed(channel, "Restricted", "This command can only be used in Guilds", Util.makeEmbedFooter(speaker), null, 0x00E676, null);
					} else if (requires.loud && isQuiet(channel, speaker)) {
						Util.sendEmbed(channel, "Quiet Channel", "This command cannot be used in this Channel (use #bot-commands)", Util.makeEmbedFooter(speaker), null, 0x00E676, null);
					} else {

						var args = content.substring(length);
						var argStr = args.length < 1 ? "None" : args;
						var outLog = Util.getName(speaker) + " (" + speaker.id + ") Ran command: " + cmd.trim();
						if (hasParameters) outLog += " | Args: " + argStr;
						console.log(outLog);

						if (requires.staff && guild != null) {

							var sendLogData = [
								"Command Entry",
								guild,
								speaker,
								{name: "Username", value: speaker.toString()},
								{name: "Channel Name", value: channel.toString()},
								{name: "Command Name", value: cmd},
							];

							if (hasParameters) {
								sendLogData.push({name: "Command Argument(s)", value: argStr});
							} else {
								sendLogData.push({name: "Command Argument(s)", value: "N/A"});
							}
							
							Util.sendLog(sendLogData, colCommand);

						}

						try {
							func(cmd, args, msgObj, speaker, channel, guild, isStaff);
						} catch(err) {
							console.log("COMMAND ERROR: " + err.stack);
						}

					}

					return;

				}

			}

		}

	}
};

