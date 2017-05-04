module.exports = Cmds.addCommand({
	cmds: [";mutes", ";muted"],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Get all currently muted users",

	args: "",

	example: "",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		//var botUser = Util.getMemberById(selfId, guild);

		var nowDate = Date.now();
		var mutedGuild = Data.guildGet(guild, Data.muted);

		var sendEmbedFields = [];

		for (var targetId in mutedGuild) {
			if (!mutedGuild.hasOwnProperty(targetId)) continue;
			var nowMute = mutedGuild[targetId];
			var endTime = nowMute[1];
			var time = endTime-nowDate;
			var timeStr = Util.formatTime(time);
			var targUser = Util.getUserById(targetId);
			var targName = targUser == null ? nowMute[2] : Util.getMostName(targUser);
			sendEmbedFields.push({name: targName, value: "​\nUser: <@" + targetId + ">\n\nReason: " + nowMute[3] + "\n\nRemaining: " + timeStr + "\n​", inline: false});
		}

		Util.sendEmbed(channel, "Active Mutes", null, Util.makeEmbedFooter(speaker), null, 0x00BCD4, sendEmbedFields);
	}
});