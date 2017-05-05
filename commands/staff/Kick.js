module.exports = Cmds.addCommand({
	cmds: [";kick ", ";eject "],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Kick a user from the guild",

	args: "([@user] | [id] | [name]) ([reason])",

	example: "vaeb being weird",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		var data = Util.getDataFromString(args, [
			function(str, results) {
				return Util.getMemberByMixed(str, guild);
			},
		], true);
		if (!data) return Util.commandFailed(channel, speaker, "User not found");
		var target = data[0];
		var reason = data[1];
		if (Util.getPosition(speaker) <= Util.getPosition(target)) {
			Util.commandFailed(channel, speaker, "User has equal or higher rank");
			return;
		}
		var targName = Util.getName(target);
		var targId = Util.safe(target.id);

		var outStr = ["**You have been kicked**\n```"];
		outStr.push("Guild: " + guild.name);
		outStr.push("Reason: " + reason);
		outStr.push("```");
		Util.print(target, outStr.join("\n"));

		target.kick();
		Util.print(channel, "Kicked", Util.fix(targName), "(" + targId + ") for", Util.fix(reason));
		if (guild.id == "168742643021512705") dailyKicks.push([targId, targName + "#" + target.discriminator, reason]);

		var sendLogData = [
			"Guild Kick",
			guild,
			target,
			{name: "Username", value: target.toString()},
			{name: "Moderator", value: speaker.toString()},
			{name: "Kick Reason", value: reason}
		];
		Util.sendLog(sendLogData, colAction);
	}
});