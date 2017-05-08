var commands = Cmds.commands;

module.exports = Cmds.addCommand({
	cmds: [";syntax ", ";help ", ";cmd "],

	requires: {
		guild: false,
		loud: true
	},

	desc: "Display command information",

	args: "",

	example: "",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		var hasFound = false;
		
		for (var i = 0; i < commands.length; i++) {
			var sendEmbedFields = [];
			var cmdData = commands[i];

			var fullCmds = cmdData[0];
			var trimCmds = [];
			var isMatch = false;
			
			for (var c = 0; c < fullCmds.length; c++) {
				var nowTrim = fullCmds[c].trim();
				trimCmds.push(nowTrim);
				if (nowTrim == args || (nowTrim.substr(0, 1) == ";" && nowTrim.substring(1) == args)) {
					isMatch = true;
				}
			}

			if (!isMatch) continue;

			var cmdRequires = cmdData[2];
			var cmdDesc = cmdData[3];
			var cmdSyntax = cmdData[4];
			var cmdExample = cmdData[5];

			var cmdType = cmdRequires.staff ? "Staff" : cmdRequires.vaeb ? "Vaeb" : "Public";

			sendEmbedFields.push({name: "Commands", value: trimCmds.join(" | "), inline: false});
			sendEmbedFields.push({name: "Permission Level", value: cmdType, inline: false});
			sendEmbedFields.push({name: "Description", value: cmdDesc, inline: false});
			sendEmbedFields.push({name: "Syntax", value: trimCmds[0] + " " + cmdSyntax, inline: false});
			sendEmbedFields.push({name: "Example", value: trimCmds[0] + " " + cmdExample, inline: false});

			Util.sendEmbed(channel, "Command Syntax", null, Util.makeEmbedFooter(speaker), null, 0x00E676, sendEmbedFields);

			hasFound = true;

			// break;
		}

		if (!hasFound) {
			Util.sendDescEmbed(channel, "Command Syntax", "Command not found", Util.makeEmbedFooter(speaker), null, 0x00E676);
		}
	}
});