module.exports = Cmds.addCommand({
	cmds: [";clearmutes ", ";cleanslate ", ";clearhistory "],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Clear a user's mute history and unmute them if they are muted",

	args: "([@user] | [id] | [name])",

	example: "vae",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		var target = Util.getMemberByMixed(args, guild);
		if (target == null) return Util.commandFailed(channel, speaker, "User not found");
		var targetId = target.id;
		var didWork = Mutes.unMute(target.id, false, guild, Util.getPosition(speaker), null, speaker);

		if (didWork) {
			Data.guildDelete(guild, Data.history, targetId);
			var safeName = Util.getName(target);

			console.log("Cleared mute history for " + Util.getName(target));

			var sendEmbedFields = [
				{name: "Username", value: Util.getMention(target)},
				{name: "Mute History", value: Util.historyToString(Util.getHistory(target.id, guild))}
			];
			Util.sendEmbed(channel, "Cleared Mute History", null, Util.makeEmbedFooter(speaker), Util.getAvatar(target), 0x00E676, sendEmbedFields);

			var sendLogData = [
				"Cleared Mute History",
				guild,
				target,
				{name: "Username", value: target.toString()},
				{name: "Moderator", value: speaker.toString()},
				{name: "Mute History", value: Util.historyToString(Util.getHistory(target.id, guild))}
			];
			Util.sendLog(sendLogData, colAction);
		}
	}
});