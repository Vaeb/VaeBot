module.exports = Cmds.addCommand({
	cmds: [";mute ", ";warn ", ";mutehammer "],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Mute a user (in all guild channels) and add the mute to their record",

	args: "([@user] | [id] | [name]) ([reason])",

	example: "vae being weird",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		var position = Util.getPosition(speaker);
		/*if (speaker.id == "264481367545479180") {
			var data = Util.getDataFromString(args, [
				function(str, results) {
					return Util.getMemberByMixed(str, guild);
				},
			], true);
			args = speaker.id;
			if (data[1]) args += (" " + data[1]);
			position = Infinity;
		}*/
		Mutes.doMute(args, guild, position, channel, speaker);
	}
});