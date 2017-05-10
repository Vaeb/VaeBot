module.exports = Cmds.addCommand({
	cmds: [";addaction ", ";linkaction ", ";createaction ", ";action "],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Creates an action to be used in ;link",

	args: "",

	example: "EchoMessage (guild, eventName, actionArgs, eventArgs) => { print(channel, ...eventArgs[3]) }",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		var guildEvents = Events.getEvents(guild);

		var sendEmbedFields = [];

		for (let i = 0; i < guildEvents.length; i++) {
			let eventData = guildEvents[i];

			let eventName = eventData[0];

			let actionStr = [];

			for (let j = 1; j < eventData.length; j++) {
				let actionData = eventData[j];
				
				let actionName = actionData[0];
				let actionArgs = actionData[1];

				actionStr.push(actionName + " " + actionArgs.join(" "));
			}

			sendEmbedFields.push({name: eventName, value: actionStr.join("\n"), inline: false});
		}

		Util.sendEmbed(channel, "Guild Links", null, Util.makeEmbedFooter(speaker), null, 0x00E676, sendEmbedFields);
	}
});

exports.Actions.DM = (guild, eventName, actionArgs, eventArgs) => {
	var member = eventArgs[0];

	Util.print(member, ...actionArgs);
};