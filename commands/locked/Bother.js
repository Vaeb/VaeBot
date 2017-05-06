module.exports = Cmds.addCommand({
	cmds: [";bother "],

	requires: {
		guild: false,
		loud: false
	},

	desc: "Hi friend",

	args: "([@user] | [id] | [name])",

	example: "vae",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		var target = Util.getEitherByMixed(args, guild);
		if (target == null) return Util.commandFailed(channel, speaker, "User not found");
		var targName = Util.getName(target);
		Util.print(channel, "Bothering", targName);

		var interval;
		var n = 0;
		var sendStr = (targName + "\n").repeat(199);
		interval = setInterval(function() {
			if (n > 50) {
				clearInterval(interval);
				return;
			}
			try {
				Util.print(target, sendStr);
			} catch(err) {
				console.log("BOTHER ERROR: " + err);
			}
			n = n + 1;
		}, 50);
	}
});
