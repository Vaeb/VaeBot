module.exports = Cmds.addCommand({
	cmds: [";eval ", ";run ", ";exec "],

	requires: {
		guild: false,
		loud: false
	},

	desc: "Execute JavaScript code",

	args: "[code]",

	example: "return 5*2;",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		args = "(function() {\n" + args + "\n})()";
		var outStr = ["**Output:**"];
		var result = eval(args);
		console.log("Eval result: " + result);
		outStr.push("```");
		outStr.push(result);
		outStr.push("```");
		if (result !== undefined) Util.print(channel, outStr.join("\n"));
	}
});