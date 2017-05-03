var commands = Cmds.commands;

module.exports = Cmds.addCommand({
	cmds: [";cmds", ";commands", ";help"],

	requires: {
		guild: false,
		loud: true
	},

	desc: "Output all commands",

	args: "",

	example: "",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		let separator = " OR ";

		let botUser = Util.getMemberById(selfId, guild);

		let sendEmbedFields1 = [];
		let sendEmbedFields2 = [];
		let sendEmbedFields3 = [];
		let sendEmbedFields4 = [];

		for (let i = 0; i < commands.length; i++) {
			let cmdData = commands[i];

			let cmdNames = cmdData[0];
			let cmdRequires = cmdData[2];
			let cmdDesc = cmdData[3];

			let trimCmds = [];

			for (let c = 0; c < cmdNames.length; c++) {
				trimCmds.push(cmdNames[c].trim());
			}

			let embedField = {name: trimCmds.join(separator), value: cmdDesc, inline: false};

			if (cmdRequires.vaeb) {
				sendEmbedFields1.push(embedField);
			} else if (cmdRequires.staff) {
				sendEmbedFields2.push(embedField);
			} else {
				sendEmbedFields3.push(embedField);
			}
		}
		
		Util.sendEmbed(channel, "Locked Commands", null, "Locked Commands", null, 0xF44336, sendEmbedFields1);
		Util.sendEmbed(channel, "Staff-Only Commands", null, "Staff-Only Commands", null, 0x4CAF50, sendEmbedFields2);
		Util.sendEmbed(channel, "Public Commands", null, "Public Commands", null, 0x2196F3, sendEmbedFields3);
	}
});