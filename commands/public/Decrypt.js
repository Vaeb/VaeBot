module.exports = Cmds.addCommand({
	cmds: [";decrypt "],

	requires: {
		guild: false,
		loud: false
	},

	desc: "Decrypt text using One Time Pad",

	args: "([encryption]) ([key])",

	example: "1000110100000110010111000000010111000011011111 1100010000100110000101100001010101101110111111",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		var mix = args.split(" ");
		var encBits = mix[0];
		var keyBits = mix[1];
		var msgBits = "";
		var msgStr = "";

		if (encBits == null || keyBits == null) {
			Util.commandFailed(channel, speaker, "Required syntax: `;decrypt result key`");
			return;
		}

		for (var i = 0; i < encBits.length; i++) {
			msgBits += Util.doXOR(encBits[i], keyBits[i]);
			if ((i+1) % 8 == 0) {
				msgStr += String.fromCharCode(parseInt(msgBits.substr(i-7, 8), 2).toString(10));
			}
		}
		Util.print(channel, "Result:", Util.safe(msgStr));
	}
});