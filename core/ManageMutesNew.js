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
        -Write UnMute
        -Write RemMute
        -Write ChangeMute
        -TEST

*/

function sendMuteMessage(guild, channel, userId, actionType, messageType, userMember, moderatorResolvable, moderatorMention, totalMutes, muteLength, reason, endStr) { // Send mute log, direct message, etc.
    // Will keep DM as text (rather than embed) to save send time

    const hasMember = userMember != null;
    const memberMention = hasMember ? userMember.toString() : `<@${userId}>`;

    if (actionType === 'Mute') {
        if (messageType === 'Channel') {
            const sendEmbedFields = [
                { name: 'Username', value: memberMention },
                { name: 'Mute Reason', value: reason },
                { name: 'Mute Expires', value: endStr },
                { name: 'Time Remaining', value: muteLength },
            ];
            Util.sendEmbed(channel, 'User Muted', null, Util.makeEmbedFooter(moderatorResolvable), Util.getAvatar(userMember), 0x00E676, sendEmbedFields);
        } else if (messageType === 'DM') {
            if (!hasMember) return;

            const outStr = ['**You have been muted**\n```'];
            outStr.push(`Guild: ${guild.name}`);
            outStr.push(`Reason: ${reason}`);
            outStr.push(`Mute expires: ${endStr}`);
            outStr.push(`Time remaining: ${muteLength}`);
            outStr.push('```');
            Util.print(userMember, outStr.join('\n'));
        } else if (messageType === 'Log') {
            const sendLogData = [
                'User Muted',
                guild,
                userMember || userId,
                { name: 'Username', value: memberMention }, // Can resolve from user id
                { name: 'Moderator', value: moderatorMention },
                { name: 'Mute Reason', value: reason },
                { name: 'Mute Length', value: reason },
                { name: 'Mute Expires', value: endStr },
                { name: 'Mute History', value: `${totalMutes} mutes` },
            ];

            Util.sendLog(sendLogData, colAction);
        }
    } else if (actionType === 'UnMute') {
        if (messageType === 'Channel') {
            const sendEmbedFields = [
                { name: 'Username', value: memberMention },
                { name: 'Mute History', value: `${totalMutes} mutes` },
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
                { name: 'Mute History', value: `${totalMutes} mutes` },
            ];

            Util.sendLog(sendLogData, colAction);
        }
    }
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
    for (let i = muteTimeouts.length - 1; i >= 0; i--) {
        const timeoutData = muteTimeouts[i];
        if (timeoutData.guildId === guild.id && timeoutData.userId === userId) {
            clearTimeout(timeoutData.timeout);
            console.log(`Removed mute timeout for ${userId}`);
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
                addTimeout(guild, userId, endTick);
                return;
            }

            exports.unMute(guild, null, userId, 'System');
        }, remaining)),
    });

    console.log(`Added mute timeout for ${userId} @ ${guild.id}`);
}

function canMute(member, moderator) { // Check if member can be muted
    if (!member) return true;

    const memberPos = Util.getPosition(member);
    const moderatorPos = typeof moderator === 'string' ? Infinity : Util.getPosition(moderator);
    return (moderatorPos > memberPos && member.id !== vaebId) || (Util.isObject(moderator) && moderator.id === vaebId);
}

exports.addMute = async function (guild, channel, userResolvable, moderatorResolvable, muteLength, reason) { // Add mute
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

    const nowTick = +new Date();

    const pastMutes = await Data.getRecords(guild, 'mutes', { user_id: userId });
    const numMutes = pastMutes.length;
    const totalMutes = numMutes + 1;

    if (muteLength == null) {
        muteLength = exports.defaultMuteLength * (2 ** numMutes);
    }

    const endTick = nowTick + muteLength;

    const dateEnd = new Date();
    dateEnd.setTime(Date.now() + muteLength);

    const endStr = `${DateFormat(dateEnd, '[dd/mm/yyyy] HH:MM:ss')} GMT`;

    // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Verify they can be muted

    if (!canMute(userMember, moderatorResolvable)) {
        return Util.commandFailed(channel, moderatorResolvable, 'User has equal or higher rank');
    }

    // Add their mute to the database

    Data.addRecord(guild, 'mutes', {
        'user_id': userId, // VARCHAR(24)
        'mod_id': moderatorId, // VARCHAR(24)
        'mute_reason': reason, // TEXT
        'end_tick': endTick, // BIGINT
        'active': 1, // BIT
    });

    // Add mute timeout (and automatically remove any active timeouts)

    addTimeout(guild, userId, endTick);

    // Remove SendMessages role

    remSendMessages(userMember);

    // Send the relevant messages

    sendMuteMessage(guild, channel, userId, 'Mute', 'Channel', userMember, moderatorResolvable, moderatorMention, totalMutes, muteLength, reason, endStr);
    sendMuteMessage(guild, channel, userId, 'Mute', 'DM', userMember, moderatorResolvable, moderatorMention, totalMutes, muteLength, reason, endStr);
    sendMuteMessage(guild, channel, userId, 'Mute', 'Log', userMember, moderatorResolvable, moderatorMention, totalMutes, muteLength, reason, endStr);

    console.log('Completed addMute');

    return true;
};

exports.changeMute = async function () { // Change a mute's time, reason, etc.

};

exports.unMute = async function (guild, channel, userResolvable, moderatorResolvable) { // Stop mute
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

    // const nowTick = +new Date();

    // Check they are actually muted

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

    // Verify they can be unmuted

    if (!canMute(userMember, moderatorResolvable)) {
        return Util.commandFailed(channel, moderatorResolvable, 'User has equal or higher rank');
    }

    // Update mute SQL record

    Data.updateRecords(guild, 'mutes', {
        mute_id: muteId,
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
    const nowTick = +new Date();
    await Promise.all(client.guilds.map(async (guild) => {
        const results = await Data.getRecords(guild, 'mutes', { end_tick: { value: nowTick, operator: '>' } });
        for (let i = 0; i < results.length; i++) {
            const muteData = results[i];
            const userId = muteData.user_id;
            const endTick = muteData.end_tick;
            addTimeout(guild, userId, endTick);
        }
    }));
};
