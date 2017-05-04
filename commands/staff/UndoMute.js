module.exports = Cmds.addCommand({
	cmds: [";undomute ", ";popmute "],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Remove a user's last mute from their record and unmute them if they are muted",

	args: "([@user] | [id] | [name])",

	example: "vae",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		var target = Util.getMemberByMixed(args, guild);
		if (target == null) return Util.commandFailed(channel, speaker, "User not found");
		var targetId = target.id;
		var didWork = Mutes.unMute(targetId, false, guild, Util.getPosition(speaker), null, speaker);

		if (didWork) {
			var newMuteTime = 0;
			var oldHistory = Data.guildGet(guild, Data.history, targetId);
			if (oldHistory) {
				var muteTime = oldHistory[0];
				if (muteTime > Mutes.defaultMuteTime) {
					newMuteTime = muteTime*0.5;
					oldHistory[0] = newMuteTime;
					Data.guildSaveData(Data.history);
				} else {
					Data.guildDelete(guild, Data.history, targetId);
				}
			}

			var sendEmbedFields = [
				{name: "Username", value: Util.getMention(target)},
				{name: "Mute History", value: Util.historyToString(newMuteTime)}
			];
			Util.sendEmbed(channel, "Reverted Mute", null, Util.makeEmbedFooter(speaker), Util.getAvatar(target), 0x00E676, sendEmbedFields);

			var sendLogData = [
				"Reverted Mute",
				guild,
				target,
				{name: "Username", value: target.toString()},
				{name: "Moderator", value: speaker.toString()},
				{name: "Mute History", value: Util.historyToString(newMuteTime)}
			];
			Util.sendLog(sendLogData, colAction);
		}
	}
});