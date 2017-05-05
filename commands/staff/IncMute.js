module.exports = Cmds.addCommand({
	cmds: [";incmute ", ";incwarn "],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Doubles a user's mute",

	args: "([@user] | [id] | [name])",

	example: "vae",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		var target = Util.getMemberByMixed(args, guild);

		if (target == null) return Util.commandFailed(channel, speaker, "User not found");

		var targetId = target.id;

		var mutedGuild = Data.guildGet(guild, Data.muted);

		var nowMute = mutedGuild[targetId];

		if (nowMute == null) return Util.commandFailed(channel, speaker, "Muted user not found");

		var reason = nowMute[3];

		var timeRemaining = Mutes.doMuteReal(target, reason, guild, Util.getPosition(speaker), channel, speaker, true);

		var sendEmbedFields = [
			{name: "Username", value: Util.getMention(target)},
			{name: "Time Remaining", value: timeRemaining}
		];
		Util.sendEmbed(channel, "Mute Increased", null, Util.makeEmbedFooter(speaker), null, 0x00E676, sendEmbedFields);
	}
});