module.exports = Cmds.addCommand({
	cmds: [";alert ", ";dm ", ";announce "],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Sends a DM to everyone in the guild with a certain role",

	args: "([@role] | [id] | [name]) ([message])",

	example: "subscribers new update today",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		if (speaker.id != guild.ownerID && speaker.id != vaebId) return Util.commandFailed(channel, speaker, "Command is owner-only");

		var data = Util.getDataFromString(args, [
			function(str, results) {
				if (str[0] == "@") str = str.substring(1);
				return Util.getRole(str, guild);
			},
			function(str, results) {
				return str;
			}
		], false);

		if (!data) return Util.commandFailed(channel, speaker, "Invalid parameters");

		var role = data[0];
		var message = data[1];

		var title = "Alert | " + Util.getMostName(speaker) + " | " + guild.name;
		var footer = Util.makeEmbedFooter(speaker);

		guild.members.forEach(member => {
			if (!Util.hasRole(member, role) || member.id == selfId) return;
			console.log("Sent DM to " + Util.getFullName(member));
			Util.sendDescEmbed(member, title, message, footer, null, 0x00BCD4);
		});
	}
});