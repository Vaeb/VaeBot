module.exports = Cmds.addCommand({
	cmds: [";encrypt "],

	requires: {
		guild: false,
		loud: false
	},

	desc: "Encrypt text using One Time Pad",

	args: "[message]",

	example: "yo dawg",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		var encBits = "";
		var keyBits = "";
		for (var c = 0; c < args.length; c++) {
			var bit = args[c].charCodeAt(0).toString(2);
			while (bit.length < 8) {
				bit = "0" + bit;
			}
			for (var b = 0; b < 8; b++) {
				var keyBit = Util.getRandomInt(0, 1);
				keyBits += keyBit;
				encBits += Util.doXOR(bit[b], keyBit);
			}
		}
		Util.print(channel, "Encryption:", encBits);
		Util.print(channel, "Key:", keyBits);
	}
});