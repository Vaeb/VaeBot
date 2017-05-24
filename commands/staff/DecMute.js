module.exports = Cmds.addCommand({
	cmds: [";decmute ", ";decwarn "],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Halves a user's mute",

	args: "([@user] | [id] | [name])",

	example: "vae",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		var target = Util.getMemberByMixed(args, guild);

		if (target == null) return Util.commandFailed(channel, speaker, "User not found");

		var speakerId = speaker.id;
		var targetId = target.id;

		var mutedGuild = Data.guildGet(guild, Data.muted);
		var nowMute = mutedGuild[targetId];

		if (nowMute == null) return Util.commandFailed(channel, speaker, "Muted user not found");

		var reason = nowMute[3];
		var origModId = nowMute[4];

		var pos = Util.getPosition(speaker);

		var origMod = Util.getMemberById(origModId, guild);
		var origModPos = origMod != null ? Util.getPosition(origMod) : -1;

		if (speakerId != vaebId && speakerId != selfId && (origModId == vaebId || pos < origModPos)) {
			console.log(speaker.name + "_2Moderator who muted has higher privilege");
			Util.commandFailed(channel, speaker, "2Moderator who muted has higher privilege");
			return;
		}

		var timeRemaining = Mutes.doMute(target, reason, guild, Util.getPosition(speaker), channel, speaker, true, 0.5);

		var sendEmbedFields = [
			{name: "Username", value: Util.getMention(target)},
			{name: "Time Remaining", value: timeRemaining}
		];
		Util.sendEmbed(channel, "Mute Decreased", null, Util.makeEmbedFooter(speaker), null, 0x00E676, sendEmbedFields);
	}
});