/*

AddRole
RemRole
DM
Mute
UnMute
Kick
Ban
DeleteMessage

eventData
    Guild
        eventName
            actionName, actionFunc, actionArgs

*/

const allEvents = {};

exports.Actions = {};

exports.getEvents = function (guild, checkEventName) {
    if (!allEvents[guild.id]) allEvents[guild.id] = {};

    const fullInfo = [];

    const guildEventsObj = allEvents[guild.id];

    if (!checkEventName) {
        for (const [eventName, actionDataEvent] of Object.entries(guildEventsObj)) {
            if (guildEventsObj[eventName] != null) {
                const eventInfo = [eventName];

                for (let i = 0; i < actionDataEvent.length; i++) {
                    const nowData = actionDataEvent[i];

                    const actionName = nowData[0];
                    const actionArgs = nowData[2];

                    eventInfo.push([actionName, actionArgs]);
                }

                fullInfo.push(eventInfo);
            }
        }
    } else {
        const actionDataEvent = guildEventsObj[checkEventName];

        if (actionDataEvent) {
            for (let i = 0; i < actionDataEvent.length; i++) {
                const nowData = actionDataEvent[i];

                const actionName = nowData[0];
                const actionArgs = nowData[2];

                fullInfo.push([actionName, actionArgs]);
            }
        }
    }

    return fullInfo;
};

exports.addEvent = function (guild, eventName, actionName, actionFunc, actionArgs) {
    if (!allEvents[guild.id]) allEvents[guild.id] = {};

    const actionDataGuild = allEvents[guild.id];

    let actionDataEvent = actionDataGuild[eventName];

    if (!actionDataEvent) {
        actionDataEvent = [];
        actionDataGuild[eventName] = actionDataEvent;
    }

    Util.log(`Added event linking ${eventName} to ${actionName}`);

    actionDataEvent.push([actionName, actionFunc, actionArgs]);
};

exports.remEvent = function (guild, eventName, actionName) {
    if (!allEvents[guild.id]) allEvents[guild.id] = {};

    const actionDataEvent = allEvents[guild.id][eventName];

    if (!actionDataEvent || actionDataEvent.length === 0) {
        return Util.log(`Event ${eventName} not found`);
    }

    for (let i = actionDataEvent.length - 1; i >= 0; i--) {
        const nowData = actionDataEvent[i];

        if (actionName == null || nowData[0] === actionName) {
            Util.log(`Removed event linking ${eventName} to ${actionName}`);

            actionDataEvent.splice(i, 1);
        }
    }

    if (actionDataEvent.length === 0) {
        allEvents[guild.id][eventName] = undefined;
    }

    return undefined;
};

exports.emit = function (guild, eventName, ...eventArgs) {
    if (!guild) return;

    if (!allEvents[guild.id]) allEvents[guild.id] = {};

    const actionDataEvent = allEvents[guild.id][eventName];

    if (!actionDataEvent || actionDataEvent.length === 0) return;

    for (let i = 0; i < actionDataEvent.length; i++) {
        const nowData = actionDataEvent[i];

        const actionName = nowData[0];
        const actionFunc = nowData[1];
        const actionArgs = nowData[2];

        Util.log(`Calling action "${actionName}" linked to ${eventName}`);

        actionFunc(guild, eventName, actionArgs, eventArgs);
    }
};

exports.Actions.AddRole = (guild, eventName, actionArgs, eventArgs) => {
    const member = eventArgs[0];

    for (let i = 0; i < actionArgs.length; i++) {
        const roleName = actionArgs[i];
        const roleObj = Util.getRole(roleName, guild);

        if (!roleObj) {
            Util.log(`[A_AddRole] ${roleName} not found`);
        } else {
            member.addRole(roleObj)
                .catch(console.error);
        }
    }
};

exports.Actions.RemRole = (guild, eventName, actionArgs, eventArgs) => {
    const member = eventArgs[0];

    for (let i = 0; i < actionArgs.length; i++) {
        const roleName = actionArgs[i];
        const roleObj = Util.getRole(roleName, guild);

        if (!roleObj) {
            Util.log(`[A_RemRole] ${roleName} not found`);
        } else {
            member.removeRole(roleObj)
                .catch(console.error);
        }
    }
};

exports.Actions.DM = (guild, eventName, actionArgs, eventArgs) => {
    const member = eventArgs[0];

    Util.print(member, ...actionArgs);
};
