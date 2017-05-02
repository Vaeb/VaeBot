exports.commands = [];

const quietChannels = {
	"284746138995785729": true,
	"289447389251502080": true,
	"285040042001432577": true,
	"284746888715042818": true,
	"294244239485829122": true,
	"290228574273798146": true
};

exports.isQuiet = function(channel, speaker) {
	if (quietChannels[channel.id] && !Util.checkStaff(channel.guild, speaker)) {
		Util.sendEmbed(channel, "Quiet Channel", "Please use #bot-commands", Util.makeEmbedFooter(speaker), null, 0x00E676, null);
		return true;
	}
	return false;
};

exports.addCommand = function(structure) {
	var cmds = structure.cmds;
	var fixedCmds = [];

	for (var i = 0; i < cmds.length; i++) {
		fixedCmds.push(cmds[i].toLowerCase());
	}

	exports.commands.push([fixedCmds, structure.func, structure.perms.vaebs, structure.perms.staff, structure.perms.guild, structure.desc, structure.syntax, structure.example]);
	exports.commands.sort();
};

exports.initCommands = function() {
	Util.bulkRequire("./commands/");
};

exports.checkMessage = (msgObj, speaker, channel, guild, content, lcontent, authorId, isStaff) => {
	var found = false;
	if ((channel.id != "168743219788644352" || authorId == vaebId)/* && (guild.id != "257235915498323969" || channel.id == "257244216772526092")*/) { //script-builders
		for (var i = 0; i < exports.commands.length; i++) {
			var holder = exports.commands[i];
			var cmds = holder[0];
			var func = holder[1];
			var vaebOnly = holder[2];
			var staffOnly = holder[3];
			var guildOnly = holder[4];
			for (var i2 = 0; i2 < cmds.length; i2++) {
				var cmd = cmds[i2];
				var length = cmd.length;
				var hasParameters = cmd[length-1] == " ";
				if (hasParameters && lcontent.substr(0, length) == cmd || !hasParameters && lcontent == cmd) {
					found = true;

					if (staffOnly && !isStaff) {
						Util.sendEmbed(channel, "Restricted", "This command can only be used by Staff", Util.makeEmbedFooter(speaker), null, 0x00E676, null);
					} else if (vaebOnly && authorId != vaebId) {
						Util.sendEmbed(channel, "Restricted", "This command can only be used by Vaeb", Util.makeEmbedFooter(speaker), null, 0x00E676, null);
					} else if (guildOnly && guild == null) {
						Util.sendEmbed(channel, "Restricted", "This command can only be used in Guilds", Util.makeEmbedFooter(speaker), null, 0x00E676, null);
					} else {
						var args = content.substring(length);
						var argStr = Util.safe(args);
						argStr = argStr.length < 1 ? "None" : argStr;
						var outLog = Util.getName(speaker) + " (" + speaker.id + ") ran command: " + cmd.trim();
						if (hasParameters) outLog += " | Args: " + argStr;
						console.log(outLog);

						if (staffOnly && guild != null) {
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
					break;
				}
			}
			if (found === true) break;
		}
	}
};

