/*

UserJoin
UserLeave
UserMute
UserUnMute
UserRoleAdded
UserRoleRemoved

RoleCreated
RoleRemoved

eventData
	Guild
		eventName
			actionName, actionFunc, actionArgs

*/

var allEvents = {};

exports.Actions = {};

exports.addEvent = function(guild, eventName, actionFunc, actionName, actionArgs) {
	if (!allEvents[guild.id]) allEvents[guild.id] = {};

	var actionDataGuild = allEvents[guild.id];

	var actionDataEvent = actionDataGuild[eventName];

	if (!actionDataEvent) {
		actionDataEvent = [];
		actionDataGuild[eventName] = actionDataEvent;
	}

	console.log(`Added event linking ${eventName} to ${actionName}`);

	actionDataEvent.push([actionName, actionFunc, actionArgs]);
};

exports.remEvent = function(guild, eventName, actionName) {
	if (!allEvents[guild.id]) allEvents[guild.id] = {};

	var actionDataEvent = allEvents[guild.id][eventName];

	if (!actionDataEvent || actionDataEvent.length == 0) {
		return console.log(`Event ${eventName} not found`);
	}

	for (let i = actionDataEvent.length-1; i >= 0; i--) {
		let nowData = actionDataEvent[i];
		
		if (actionName == null || nowData[0] == actionName) {
			console.log(`Removed event linking ${eventName} to ${actionName}`);

			actionDataEvent.splice(i, 1);
		}
	}
};

exports.emit = function(guild, eventName) {
	var eventArgs = Array.prototype.slice.call(arguments, 2);

	if (!allEvents[guild.id]) allEvents[guild.id] = {};

	var actionDataEvent = allEvents[guild.id][eventName];

	if (!actionDataEvent || actionDataEvent.length == 0) return;

	for (let i = 0; i < actionDataEvent.length; i++) {
		let nowData = actionDataEvent[i];

		let actionName = nowData[0];
		let actionFunc = nowData[1];
		let actionArgs = nowData[2];

		console.log(`Calling action "${actionName}" linked to ${eventName}`);

		actionFunc(guild, eventName, actionArgs, eventArgs);
	}
};

exports.Actions.AddRole = function(guild, eventName, actionArgs, eventArgs) {
	var member = eventArgs[0];

	for (var i = 0; i < actionArgs.length; i++) {
		var roleName = actionArgs[i];
		var roleObj = Util.getRole(roleName, guild);

		if (!roleObj) {
			console.log("[A_AddRole] " + roleName + " not found");
			continue;
		}

		member.addRole(roleObj)
		.catch(console.error);
	}
};

exports.Actions.RemRole = function(guild, eventName, actionArgs, eventArgs) {
	var member = eventArgs[0];

	for (var i = 0; i < actionArgs.length; i++) {
		var roleName = actionArgs[i];
		var roleObj = Util.getRole(roleName, guild);

		if (!roleObj) {
			console.log("[A_RemRole] " + roleName + " not found");
			continue;
		}

		member.removeRole(roleObj)
		.catch(console.error);
	}
};

exports.Actions.DM = function(guild, eventName, actionArgs, eventArgs) {
	var member = eventArgs[0];

	Util.print(member, ...actionArgs);
};