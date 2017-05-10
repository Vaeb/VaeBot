/*

UserJoin
UserLeave
UserMute
UserUnMute
UserRoleAdded
UserRoleRemoved

RoleCreated
RoleRemoved

*/

var EventsHolder = index.EventsHolder;

var eventFuncs = {};
var eventEmitters = {};

exports.Actions = {};

exports.addEvent = function(guild, eventName, actionFunc, actionName, actionArgs) {
	if (!eventEmitters[guild.id]) {
		eventFuncs[guild.id] = {};
		eventEmitters[guild.id] = new EventsHolder.EventEmitter();
	}

	var actionDataGuild = eventFuncs[guild.id];

	var nowEmitter = eventEmitters[guild.id];

	var actionData = actionDataGuild[eventName];

	if (!actionData) {
		actionData = [];
		actionDataGuild[eventName] = actionData;
	}

	console.log(`Added event linking ${eventName} to ${actionName}`);

	actionData.push([actionFunc, actionName, actionArgs]);

	nowEmitter.addListener(eventName, actionFunc);
};

exports.remEvent = function(guild, eventName, actionName) {
	if (!eventEmitters[guild.id]) {
		eventFuncs[guild.id] = {};
		eventEmitters[guild.id] = new EventsHolder.EventEmitter();
	}

	var actionDataGuild = eventFuncs[guild.id];

	var nowEmitter = eventEmitters[guild.id];
	var actionData = actionDataGuild[eventName];

	if (!actionData || actionData.length == 0) {
		return console.log(`Event ${eventName} not found`);
	}

	for (let i = actionData.length-1; i >= 0; i--) {
		let nowData = actionData[i];
		
		if (actionName == null || nowData[1] == actionName) {
			console.log(`Removed event linking ${eventName} to ${actionName}`);

			nowEmitter.removeListener(eventName, nowData[0]);
			actionData.splice(i, 1);
		}
	}
};

exports.emit = function(guild, eventName) {
	var args = Array.prototype.slice.call(arguments, 2);

	if (!eventEmitters[guild.id]) {
		eventFuncs[guild.id] = {};
		eventEmitters[guild.id] = new EventsHolder.EventEmitter();
	}

	var actionDataGuild = eventFuncs[guild.id];

	var nowEmitter = eventEmitters[guild.id];
	var actionData = actionDataGuild[eventName];

	if (!actionData || actionData.length == 0) return;

	for (let i = 0; i < actionData.length; i++) {
		let nowData = actionData[i];
		let actionName = nowData[1];

		console.log(`Calling action "${actionName}" linked to ${eventName}`);

		nowEmitter.emit(eventName, guild, eventName, nowData[2], args);
	}
};

exports.Actions.AddRole = function(guild, eventName, actionData, eventData) {
	var member = eventData[0];

	for (var i = 0; i < actionData.length; i++) {
		var roleName = actionData[i];
		var roleObj = Util.getRole(roleName, guild);

		if (!roleObj) {
			console.log("[A_AddRole] " + roleName + " not found");
			continue;
		}

		member.addRole(roleObj)
		.catch(console.error);
	}
};

exports.Actions.RemRole = function(guild, eventName, actionData, eventData) {
	var member = eventData[0];

	for (var i = 0; i < actionData.length; i++) {
		var roleName = actionData[i];
		var roleObj = Util.getRole(roleName, guild);

		if (!roleObj) {
			console.log("[A_RemRole] " + roleName + " not found");
			continue;
		}

		member.removeRole(roleObj)
		.catch(console.error);
	}
};

exports.Actions.DM = function(guild, eventName, actionData, eventData) {
	var member = eventData[0];

	Util.print(member, ...actionData);
};