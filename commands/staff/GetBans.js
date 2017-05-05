module.exports = Cmds.addCommand({
	cmds: [";bans", ";getbans"],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Get all banned users",

	args: "",

	example: "",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		guild.fetchBans().then((bans, err) => {
			if (err) {
				Util.print(channel, "Error retrieving bans:", err);
			} else {
				var outStr = ["**Guild bans:**\n```"];
				bans.forEach(function(user, index, self) {
					outStr.push("Username: " + Util.getName(user));
				});
				outStr.push("```");
				Util.print(channel, outStr.join("\n"));
			}
		});
	}
});