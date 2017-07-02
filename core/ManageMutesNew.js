const DateFormat = index.DateFormat;

const muteTimeouts = [];
let muteTimeoutId = 0;

exports.defaultMuteLength = 1800000;

/*

    -Mutes have an optional set_mute_time parameter
    -When muted without it, user will be muted 2^(numMutes-1), including mutes with set_mute_time (but not affect by their mute time)
    -IncMute/DecMute can specify how many times the mute time should be doubled (acts like set_mute_time in not affecting the next mute)
    -ChangeMute command to change mute time, reason, etc.
    -Warn can mute a user for any amount of time, but defaults to 0.5 hours (and does not affect next mute time)

    ToDo:
        -Write RemMute
        -TEST

*/

function getMuteHistoryStr(totalMutes) {
    let out = `${totalMutes} mute`;
    if (totalMutes !== 1) out += 's';
    return out;
}

function sendMuteMessage(guild, channel, userId, actionType, messageType, userMember, moderatorResolvable, moderatorMention, totalMutes, muteLengthStr, muteReason, endStr) { // Send mute log, direct message, etc.
    // Will keep DM as text (rather than embed) to save send time

    const hasMember = userMember != null;
    const memberMention = hasMember ? userMember.toString() : `<@${userId}>`;
    const muteHistoryStr = getMuteHistoryStr(totalMutes);

    if (actionType === 'Mute') {
        if (messageType === 'Channel') {
            const sendEmbedFields = [
                { name: 'Username', value: memberMention },
                { name: 'Mute Reason', value: muteReason },
                { name: 'Mute Length', value: muteLengthStr },
                { name: 'Mute Expires', value: endStr },
            ];
            Util.sendEmbed(channel, 'User Muted', null, Util.makeEmbedFooter(moderatorResolvable), Util.getAvatar(userMember), 0x00E676, sendEmbedFields);
        } else if (messageType === 'DM') {
            if (!hasMember) return;

            const outStr = ['**You have been muted**\n```'];
            outStr.push(`Guild: ${guild.name}`);
            outStr.push(`Mute reason: ${muteReason}`);
            outStr.push(`Mute length: ${muteLengthStr}`);
            outStr.push(`Mute expires: ${endStr}`);
            outStr.push('```');
            Util.print(userMember, outStr.join('\n'));
        } else if (messageType === 'Log') {
            const sendLogData = [
                'User Muted',
                guild,
                userMember || userId,
                { name: 'Username', value: memberMention }, // Can resolve from user id
                { name: 'Moderator', value: moderatorMention },
                { name: 'Mute Reason', value: muteReason },
                { name: 'Mute Expires', value: endStr },
                { name: 'Mute Length', value: muteLengthStr },
                { name: 'Mute History', value: muteHistoryStr },
            ];

            Util.sendLog(sendLogData, colAction);
        }
    } else if (actionType === 'UnMute') {
        if (messageType === 'Channel') {
            const sendEmbedFields = [
                { name: 'Username', value: memberMention },
                { name: 'Mute History', value: muteHistoryStr },
            ];
            Util.sendEmbed(channel, 'User Unmuted', null, Util.makeEmbedFooter(moderatorResolvable), Util.getAvatar(userMember), 0x00E676, sendEmbedFields);
        } else if (messageType === 'DM') {
            if (!hasMember) return;

            const outStr = ['**You have been unmuted**\n```'];
            outStr.push(`Guild: ${guild.name}`);
            outStr.push('```');
            Util.print(userMember, outStr.join('\n'));
        } else if (messageType === 'Log') {
            const sendLogData = [
                'User Unmuted',
                guild,
                userMember || userId,
                { name: 'Username', value: memberMention }, // Can resolve from user id
                { name: 'Moderator', value: moderatorMention }, // Can resolve from user id
                { name: 'Mute History', value: muteHistoryStr },
            ];

            Util.sendLog(sendLogData, colAction);
        }
    } else if (actionType === 'ChangeMute') {
        let fieldsChanged = [];

        if (muteReason.new !== muteReason.old) fieldsChanged.push('Mute Reason');
        if (muteLengthStr.new !== muteLengthStr.old) fieldsChanged.push('Mute Length');
        if (endStr.new !== endStr.old) fieldsChanged.push('Mute Expiration');

        fieldsChanged = fieldsChanged.join(', ');

        if (messageType === 'Channel') {
            const sendEmbedFields = [
                { name: 'Username', value: memberMention },
                { name: 'Fields Changed', value: fieldsChanged },
                { name: 'Old Mute Reason', value: muteReason.old },
                { name: 'New Mute Reason', value: muteReason.new },
                { name: 'Old Mute Length', value: muteLengthStr.old },
                { name: 'New Mute Length', value: muteLengthStr.new },
                { name: 'Old Mute Expires', value: endStr.old },
                { name: 'New Mute Expires', value: endStr.new },
            ];
            Util.sendEmbed(channel, 'Mute Changed', null, Util.makeEmbedFooter(moderatorResolvable), Util.getAvatar(userMember), 0x00E676, sendEmbedFields);
        } else if (messageType === 'DM') {
            if (!hasMember) return;

            const outStr = ['**Your mute has been changed**\n```'];
            outStr.push(`Guild: ${guild.name}`);
            if (muteReason.new !== muteReason.old) {
                outStr.push(`Old mute reason: ${muteReason.old}`);
                outStr.push(`New mute reason: ${muteReason.new}`);
            }
            if (muteLengthStr.new !== muteLengthStr.old) {
                outStr.push(`Old mute length: ${muteLengthStr.old}`);
                outStr.push(`New mute length: ${muteLengthStr.new}`);
            }
            if (endStr.new !== endStr.old) {
                outStr.push(`Old mute expiration: ${endStr.old}`);
                outStr.push(`New mute expiration: ${endStr.new}`);
            }
            outStr.push('```');
            Util.print(userMember, outStr.join('\n'));
        } else if (messageType === 'Log') {
            const sendLogData = [
                'Mute Changed',
                guild,
                userMember || userId,
                { name: 'Username', value: memberMention },
                { name: 'Moderator', value: moderatorMention },
                { name: 'Old Mute Reason', value: muteReason.old },
                { name: 'New Mute Reason', value: muteReason.new },
                { name: 'Old Mute Expires', value: endStr.old },
                { name: 'New Mute Expires', value: endStr.new },
                { name: 'Old Mute Length', value: muteLengthStr.old },
                { name: 'New Mute Length', value: muteLengthStr.new },
                { name: 'Mute History', value: muteHistoryStr },
            ];

            Util.sendLog(sendLogData, colAction);
        }
    }

    console.log(`Sent a ${messageType} alert for the ${actionType} event`);
}

function remSendMessages(member) { // Remove SendMessages role
    if (!member) return;

    const linkedGuilds = Data.getLinkedGuilds(member.guild);

    for (let i = 0; i < linkedGuilds.length; i++) {
        const linkedGuild = linkedGuilds[i];
        const linkedMember = Util.getMemberById(member.id, linkedGuild);

        if (linkedMember) {
            const role = Util.getRole('SendMessages', linkedMember);
            if (role != null) {
                linkedMember.removeRole(role)
                .then(() => {
                    console.log(`Link-removed SendMessages from ${Util.getName(linkedMember)} @ ${linkedGuild.name}`);
                })
                .catch(error => console.log(`\n[E_LinkRoleRem1] ${error}`));
            }
        }
    }
}

function addSendMessages(member) { // Add SendMessages role
    if (!member) return;

    const linkedGuilds = Data.getLinkedGuilds(member.guild);

    for (let i = 0; i < linkedGuilds.length; i++) {
        const linkedGuild = linkedGuilds[i];
        const linkedMember = Util.getMemberById(member.id, linkedGuild);

        if (linkedMember) {
            const role = Util.getRole('SendMessages', linkedGuild);
            if (role != null) {
                linkedMember.addRole(role)
                .then(() => {
                    console.log(`Link-added SendMessages to ${Util.getName(linkedMember)} @ ${linkedGuild.name}`);
                })
                .catch(error => console.log(`\n[E_LinkRoleAdd1] ${error}`));
            }
        }
    }
}

function remTimeout(guild, userId) { // Remove mute timeout
    console.log(`Removing any active mute timeouts for ${userId} @ ${guild.name}`);
    for (let i = muteTimeouts.length - 1; i >= 0; i--) {
        const timeoutData = muteTimeouts[i];
        if (timeoutData.guildId === guild.id && timeoutData.userId === userId) {
            clearTimeout(timeoutData.timeout);
            console.log(`Removed mute timeout for ${userId} @ ${guild.name}`);
            muteTimeouts.splice(i, 1);
        }
    }
}

async function addTimeout(guild, userId, endTick) { // Add mute timeout
    const nowTick = +new Date();
    const remaining = endTick - nowTick;

    const member = await guild.fetchMember(userId);
    if (!member) { // Member no longer in the server
        // todo
        return;
    }

    remTimeout(guild, userId);

    const timeoutLength = Math.min(remaining, 2147483646);
    const timeoutRemaining = remaining - timeoutLength;

    if (timeoutRemaining > 0) console.log(`Split ${userId} mute timeout into multiple timeouts: ${timeoutRemaining}`);

    const nowTimeoutId = muteTimeoutId++;

    muteTimeouts.push({
        'timeoutId': nowTimeoutId,
        'guildId': guild.id,
        'userId': userId,
        'timeout': (setTimeout(() => {
            for (let i = 0; i < muteTimeouts.length; i++) {
                const timeoutData = muteTimeouts[i];
                if (timeoutData.timeoutId === nowTimeoutId) {
                    muteTimeouts.splice(i, 1);
                    break;
                }
            }

            if (timeoutRemaining > 0) {
                console.log(`Mute shard timeout for ${userId} @ ${guild.name} ended; Starting next shard...`);
                addTimeout(guild, userId, endTick);
                return;
            }

            console.log(`Mute timeout for ${userId} @ ${guild.name} ended; Unmuting...`);

            exports.unMute(guild, null, userId, 'System');
        }, remaining)),
    });

    console.log(`Added mute timeout for ${userId} @ ${guild.name}; Remaining: ${remaining} ms`);
}

function canMute(member, moderator) { // Check if member can be muted
    if (!member) return true;

    const memberPos = Util.getPosition(member);
    const moderatorPos = typeof moderator === 'string' ? Infinity : Util.getPosition(moderator);
    return (moderatorPos > memberPos && member.id !== vaebId) || (Util.isObject(moderator) && moderator.id === vaebId);
}

exports.addMute = async function (guild, channel, userResolvable, moderatorResolvable, muteData) { // Add mute
    // Resolve parameter data

    if (!muteData) muteData = {};

    let muteLength = muteData.time;
    const muteReason = muteData.reason || 'N/A';

    let userType = 0; // Member
    let userMember = userResolvable;
    let userId = userResolvable;

    let moderatorType = 0; // Member
    let moderatorMention = moderatorResolvable;
    let moderatorId = moderatorResolvable;

    if (typeof userResolvable === 'string') userType = 1; // ID

    if (typeof moderatorResolvable === 'string') moderatorType = 1; // System

    if (userType === 0) { // Member
        userId = userResolvable.id;
    } else if (userType === 1) { // ID
        userMember = guild.members.get(userResolvable);
    }

    if (moderatorType === 0) { // Member
        moderatorMention = moderatorResolvable.toString();
        moderatorId = moderatorResolvable.id;
    } else if (moderatorType === 1) { // System
        moderatorId = selfId;
    }

    console.log(`Started addMute on ${userId}`);

    // Verify they can be muted

    if (!canMute(userMember, moderatorResolvable)) {
        return Util.commandFailed(channel, moderatorResolvable, 'User has equal or higher rank');
    }

    // Get mute time data

    const startTick = +new Date();

    const pastMutes = await Data.getRecords(guild, 'mutes', { user_id: userId });
    const numMutes = pastMutes.length;
    const totalMutes = numMutes + 1;

    if (muteLength == null) {
        muteLength = exports.defaultMuteLength * (2 ** numMutes);
    }

    const endTick = startTick + muteLength;

    const dateEnd = new Date();
    dateEnd.setTime((+dateEnd) + muteLength);

    const endStr = `${DateFormat(dateEnd, '[dd/mm/yyyy] HH:MM:ss')} GMT`;
    const muteLengthStr = Util.historyToString(muteLength);

    // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Add their mute to the database

    Data.updateRecords(guild, 'mutes', {
        user_id: userId,
    }, {
        active: 0,
    })
    .then(() => {
        Data.addRecord(guild, 'mutes', {
            'user_id': userId, // VARCHAR(24)
            'mod_id': moderatorId, // VARCHAR(24)
            'mute_reason': muteReason, // TEXT
            'start_tick': startTick, // BIGINT
            'end_tick': endTick, // BIGINT
            'active': 1, // BIT
        });
    })
    .catch(console.error);

    // Add mute timeout (and automatically remove any active timeouts)

    addTimeout(guild, userId, endTick);

    // Remove SendMessages role

    remSendMessages(userMember);

    // Send the relevant messages

    sendMuteMessage(guild, channel, userId, 'Mute', 'Channel', userMember, moderatorResolvable, moderatorMention, totalMutes, muteLengthStr, muteReason, endStr);
    sendMuteMessage(guild, channel, userId, 'Mute', 'DM', userMember, moderatorResolvable, moderatorMention, totalMutes, muteLengthStr, muteReason, endStr);
    sendMuteMessage(guild, channel, userId, 'Mute', 'Log', userMember, moderatorResolvable, moderatorMention, totalMutes, muteLengthStr, muteReason, endStr);

    console.log('Completed addMute');

    return true;
};

exports.changeMute = async function (guild, channel, userResolvable, moderatorResolvable, newData) { // Change a mute's time, reason, etc.
    // Resolve parameter data

    let userType = 0; // Member
    let userMember = userResolvable;
    let userId = userResolvable;

    let moderatorType = 0; // Member
    let moderatorMention = moderatorResolvable;
    // let moderatorId = moderatorResolvable;

    if (typeof userResolvable === 'string') userType = 1; // ID

    if (typeof moderatorResolvable === 'string') moderatorType = 1; // System

    if (userType === 0) { // Member
        userId = userResolvable.id;
    } else if (userType === 1) { // ID
        userMember = guild.members.get(userResolvable);
    }

    if (moderatorType === 0) { // Member
        moderatorMention = moderatorResolvable.toString();
        // moderatorId = moderatorResolvable.id;
    } else if (moderatorType === 1) { // System
        // moderatorId = selfId;
    }

    console.log(`Started changeMute on ${userId}`);

    // Verify mute can be changed

    if (!canMute(userMember, moderatorResolvable)) {
        return Util.commandFailed(channel, moderatorResolvable, 'User has equal or higher rank');
    }

    // Get mute data and check they are actually muted

    const pastMutes = await Data.getRecords(guild, 'mutes', { user_id: userId });
    const totalMutes = pastMutes.length;

    let muteId;
    let muteRecord;

    for (let i = 0; i < pastMutes.length; i++) {
        if (Data.fromBuffer(pastMutes[i].active) === 1) {
            muteId = pastMutes[i].mute_id; // Number
            muteRecord = pastMutes[i];
            break;
        }
    }

    if (!muteId) {
        return Util.commandFailed(channel, moderatorResolvable, 'User is not muted');
    }

    // Change mute in DB

    const newDataSQL = {};

    const startTick = muteRecord.start_tick;

    const endTickOld = muteRecord.end_tick;
    const muteLengthOld = endTickOld - startTick;
    const muteReasonOld = muteRecord.mute_reason;

    let endTickNew;
    let muteLengthNew = newData.time;
    let muteReasonNew = newData.reason;

    // let changedTime = true;
    // let changedReason = true;

    if (!newData.time) {
        muteLengthNew = muteLengthOld;
        endTickNew = endTickOld;
    } else {
        endTickNew = startTick + muteLengthNew;
    }

    if (!newData.reason) {
        muteReasonNew = muteReasonOld;
    }

    if (newData.time && endTickNew !== muteRecord.end_tick) {
        newDataSQL.end_tick = endTickNew;
    } else {
        // changedTime = false;
    }

    if (newData.reason && muteReasonNew !== muteRecord.mute_reason) {
        newDataSQL.mute_reason = muteReasonNew;
    } else {
        // changedReason = false;
    }

    Data.updateRecords(guild, 'mutes', {
        mute_id: muteId,
    }, newDataSQL);

    // Get changed data and format it

    const muteLengthStrOld = Util.historyToString(muteLengthOld);
    const muteLengthStrNew = Util.historyToString(muteLengthNew);

    const dateEndOld = new Date(); dateEndOld.setTime(endTickOld);
    const dateEndNew = new Date(); dateEndNew.setTime(endTickNew);

    const endStrOld = `${DateFormat(dateEndOld, '[dd/mm/yyyy] HH:MM:ss')} GMT`;
    const endStrNew = `${DateFormat(dateEndNew, '[dd/mm/yyyy] HH:MM:ss')} GMT`;

    const muteLengthStrChanges = { old: muteLengthStrOld, new: muteLengthStrNew };
    const endStrChanges = { old: endStrOld, new: endStrNew };
    const muteReasonChanges = { old: muteReasonOld, new: muteReasonNew };

    // Send relevant messages

    sendMuteMessage(guild, channel, userId, 'ChangeMute', 'Channel', userMember, moderatorResolvable, moderatorMention, totalMutes, muteLengthStrChanges, muteReasonChanges, endStrChanges);
    sendMuteMessage(guild, channel, userId, 'ChangeMute', 'DM', userMember, moderatorResolvable, moderatorMention, totalMutes, muteLengthStrChanges, muteReasonChanges, endStrChanges);
    sendMuteMessage(guild, channel, userId, 'ChangeMute', 'Log', userMember, moderatorResolvable, moderatorMention, totalMutes, muteLengthStrChanges, muteReasonChanges, endStrChanges);

    console.log('Completed changeMute');

    return true;
};

exports.unMute = async function (guild, channel, userResolvable, moderatorResolvable) { // Stop mute
    // Resolve parameter data

    let userType = 0; // Member
    let userMember = userResolvable;
    let userId = userResolvable;

    let moderatorType = 0; // Member
    let moderatorMention = moderatorResolvable;
    // let moderatorId = moderatorResolvable;

    if (typeof userResolvable === 'string') userType = 1; // ID

    if (typeof moderatorResolvable === 'string') moderatorType = 1; // System

    if (userType === 0) { // Member
        userId = userResolvable.id;
    } else if (userType === 1) { // ID
        userMember = guild.members.get(userResolvable);
    }

    if (moderatorType === 0) { // Member
        moderatorMention = moderatorResolvable.toString();
        // moderatorId = moderatorResolvable.id;
    } else if (moderatorType === 1) { // System
        // moderatorId = selfId;
    }

    console.log(`Started unMute on ${userId}`);

    // Verify they can be unmuted

    if (!canMute(userMember, moderatorResolvable)) { // Also need to check current mod doesn't equal/outrank them
        return Util.commandFailed(channel, moderatorResolvable, 'User has equal or higher rank');
    }

    // Get mute time data and check they are actually muted

    const pastMutes = await Data.getRecords(guild, 'mutes', { user_id: userId });
    const totalMutes = pastMutes.length;

    let muteId;

    for (let i = 0; i < pastMutes.length; i++) {
        if (Data.fromBuffer(pastMutes[i].active) === 1) {
            muteId = pastMutes[i].mute_id; // Number
            break;
        }
    }

    if (!muteId) {
        return Util.commandFailed(channel, moderatorResolvable, 'User is not muted');
    }

    // Update mute SQL record

    Data.updateRecords(guild, 'mutes', {
        user_id: userId,
    }, {
        active: 0,
    });

    // Remove mute timeout (if stopped early)

    remTimeout(guild, userId);

    // Add SendMessages role

    addSendMessages(userMember);

    // Send the relevant messages

    sendMuteMessage(guild, channel, userId, 'UnMute', 'Channel', userMember, moderatorResolvable, moderatorMention, totalMutes);
    sendMuteMessage(guild, channel, userId, 'UnMute', 'DM', userMember, moderatorResolvable, moderatorMention, totalMutes);
    sendMuteMessage(guild, channel, userId, 'UnMute', 'Log', userMember, moderatorResolvable, moderatorMention, totalMutes);

    console.log('Completed unMute');

    return true;
};

exports.remMute = async function () { // Undo mute

};

exports.initialize = async function () { // Get mute data from db, start all initial mute timeouts
    // const nowTick = +new Date();
    await Promise.all(client.guilds.map(async (guild) => {
        // const results = await Data.getRecords(guild, 'mutes', { end_tick: { value: nowTick, operator: '>' } });
        const results = await Data.getRecords(guild, 'mutes', { active: 1 });
        for (let i = 0; i < results.length; i++) {
            const muteStored = results[i];
            const userId = muteStored.user_id;
            const endTick = muteStored.end_tick;
            addTimeout(guild, userId, endTick);
        }
    }));
    console.log('Finished initializing mute timeouts');
};
