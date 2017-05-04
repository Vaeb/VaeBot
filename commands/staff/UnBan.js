module.exports = Cmds.addCommand({
	cmds: [";unban ", ";remban "],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Unban a user from the guild",

	args: "([@user] | [id] | [name])",

	example: "vae",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
	guild.fetchBans().then((bans, err) => {
		if (err) {
			Util.print(channel, "Error retrieving bans:", err);
			return;
		}

		var target = Util.searchUserPartial(bans, args);
		if (target == null) {
			Util.commandFailed(channel, speaker, "User not found");
			return;
		}

		var targName = Util.getName(target);
		var targId = Util.safe(target.id);

		guild.unban(target);

		Util.print(channel, "Unbanned", Util.fix(targName), "(" + targId + ")");

		var sendLogData = [
			"Guild Unban",
			guild,
			target,
			{name: "Username", value: target.toString()},
			{name: "Moderator", value: speaker.toString()}
		];
		Util.sendLog(sendLogData, colAction);

		var outStr = ["**You have been unbanned**\n```"];
		outStr.push("Guild: " + guild.name);
		outStr.push("```");
		Util.print(target, outStr.join("\n"));
	});
	}
});