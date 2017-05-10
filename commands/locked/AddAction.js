module.exports = Cmds.addCommand({
	cmds: [";addaction ", ";linkaction ", ";createaction ", ";action "],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Creates an action to be used in ;link",

	args: "",

	example: "EchoMessage (guild, eventName, actionArgs, eventArgs) => { print(channel, ...eventArgs[3]) };",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		var spaceIndex = args.indexOf(" ");
		if (spaceIndex == -1) return Util.commandFailed(channel, speaker, "Invalid parameters");

		var actionName = args.substring(0, spaceIndex);
		var actionFuncStr = args.substring(spaceIndex+1);

		eval(`Events.${actionName} = ${actionFuncStr}`);
	}
});