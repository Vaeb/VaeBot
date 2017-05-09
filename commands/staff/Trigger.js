module.exports = Cmds.addCommand({
	cmds: [";trigger ", ";event ", ";link "],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Link an event to an action",

	args: "({ [event_name_1] ... [event_name_n1] }) ({ [action_1_name] [action_1_param_1] ... [action_param_n2] }) ... ({ [action_n3_name] [action_n3_param_1] ... [action_n3_param_n4] })",
	// args: "([event_name_1] ... [event_name_n]) (-[action_1_name] [action_1_param_1] ... [action_param_n]) ... (-[action_n_name] [action_n_param_1] ... [action_n_param_o])",

	example: "{ UserJoin UserUnMute } { AddRole SendMessages RandomRole } { DM CmdInfo }",
	// example: "UserJoin UserUnMute -AddRole SendMessages RandomRole -DM CmdInfo",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		var event = null;
		var actions = [];

		var numOpen = 0;
		var lastOpen = 0;

		for (var i = 0; i < args.length; i++) {
			var char = args[i];

			if (char == "{") {
				if (numOpen == 0) {
					lastOpen = i;
				}

				numOpen++;
			} else if (char == "}") {
				numOpen--;

				if (numOpen == 0) {
					var paramStr = args.substring(lastOpen+1, i);

					if (event == null) {
						event = paramStr;
					} else {
						actions.push(paramStr);
					}
				}
			}
		}

		console.log(event);
		console.log(actions);
	}
});