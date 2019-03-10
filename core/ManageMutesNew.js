const DateFormat = index.DateFormat;

const muteTimeouts = [];
let muteTimeoutId = 0;

const muteCache = {};
const muteCacheActive = {};

let nextMuteId;

exports.defaultMuteLength = 1800000;

/*

    -Mutes have an optional set_mute_time parameter
    -When muted without it, user will be muted 2^(numMutes-1), including mutes with set_mute_time (but not affect by their mute time)
    -IncMute/DecMute can specify how many times the mute time should be doubled (acts like set_mute_time in not affecting the next mute)
    -ChangeMute command to change mute time, reason, etc.
    -Warn can mute a user for any amount of time, but defaults to 0.5 hours (and does not affect next mute time)

*/

function getMuteHistoryStr(totalMutes) {
    let out = `${totalMutes} mute`;
    if (totalMutes !== 1) out += 's';
    return out;
}

function sendMuteMessage(
    guild,
    channel,
    userId,
    actionType,
    messageType,
    userMember,
    moderatorResolvable,
    moderatorMention,
    totalMutes,
    muteLengthStr,
    muteReason,
    endStr,
) {
    // Send mute log, direct message, etc.
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
            Util.sendEmbed(
                channel,
                'User Muted',
                null,
                Util.makeEmbedFooter(moderatorResolvable),
                Util.getAvatar(userMember),
                colGreen,
                sendEmbedFields,
            );
        } else if (messageType === 'DM') {
            if (!hasMember) return;

            const outStr = ['**You have been muted**\n```'];
            outStr.push(`Guild: ${guild.name}`);
            outStr.push(`Mute reason: ${muteReason}`);
            outStr.push(`Mute length: ${muteLengthStr}`);
            outStr.push(`Mute expires: ${endStr}`);
            outStr.push(`Mute history: ${muteHistoryStr}`);
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
                { name: 'Mute Length', value: muteLengthStr },
                { name: 'Mute Expires', value: endStr },
                { name: 'Mute History', value: muteHistoryStr },
            ];

            Util.sendLog(sendLogData, colAction);
        }
    } else if (actionType === 'ChangeMute') {
        let fieldsChanged = [];

        if (muteReason.new !== muteReason.old) fieldsChanged.push('Mute Reason');
        if (muteLengthStr.new !== muteLengthStr.old) fieldsChanged.push('Mute Length');

        const fieldsChangedArr = fieldsChanged;
        fieldsChanged = fieldsChangedArr.join(', ');

        if (messageType === 'Channel') {
            const sendEmbedFields = [{ name: 'Username', value: memberMention }, { name: 'Fields Changed', value: fieldsChanged }];

            if (fieldsChangedArr.includes('Mute Reason')) {
                sendEmbedFields.push({ name: 'Old Mute Reason', value: muteReason.old });
                sendEmbedFields.push({ name: 'New Mute Reason', value: muteReason.new });
            }

            if (fieldsChangedArr.includes('Mute Length')) {
                sendEmbedFields.push({ name: 'Old Mute Length', value: muteLengthStr.old });
                sendEmbedFields.push({ name: 'New Mute Length', value: muteLengthStr.new });
            }

            console.log(
                muteLengthStr.old,
                '|',
                muteLengthStr.new,
                '|',
                muteLengthStr.old == muteLengthStr.new,
                '|',
                fieldsChangedArr,
                '|',
                fieldsChangedArr.includes('Mute Length'),
            );

            Util.sendEmbed(
                channel,
                'Mute Changed',
                null,
                Util.makeEmbedFooter(moderatorResolvable),
                Util.getAvatar(userMember),
                colGreen,
                sendEmbedFields,
            );
        } else if (messageType === 'DM') {
            if (!hasMember) return;

            const outStr = ['**Your mute has been changed**\n```'];
            outStr.push(`Guild: ${guild.name}`);
            if (muteReason.new !== muteReason.old) {
                outStr.push(`Old mute reason: ${muteReason.old} | New mute reason: ${muteReason.new}`);
            }
            if (muteLengthStr.new !== muteLengthStr.old) {
                outStr.push(`Old mute length: ${muteLengthStr.old} | New mute length: ${muteLengthStr.new}`);
            }
            if (endStr.new !== endStr.old) {
                outStr.push(`Old mute expiration: ${endStr.old} | New mute expiration: ${endStr.new}`);
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
                { name: 'Old Mute Length', value: muteLengthStr.old },
                { name: 'New Mute Length', value: muteLengthStr.new },
                { name: 'Old Mute Expires', value: endStr.old },
                { name: 'New Mute Expires', value: endStr.new },
                { name: 'Mute History', value: muteHistoryStr },
            ];

            Util.sendLog(sendLogData, colAction);
        }
    } else if (actionType === 'UnMute') {
        if (messageType === 'Channel') {
            const sendEmbedFields = [{ name: 'Username', value: memberMention }, { name: 'Mute History', value: muteHistoryStr }];
            Util.sendEmbed(
                channel,
                'User Unmuted',
                null,
                Util.makeEmbedFooter(moderatorResolvable),
                Util.getAvatar(userMember),
                colGreen,
                sendEmbedFields,
            );
        } else if (messageType === 'DM') {
            if (!hasMember) return;

            const outStr = ['**You have been unmuted**\n```'];
            outStr.push(`Guild: ${guild.name}`);
            outStr.push(`Mute history: ${muteHistoryStr}`);
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
    } else if (actionType === 'RemMute') {
        if (messageType === 'Channel') {
            const sendEmbedFields = [{ name: 'Username', value: memberMention }, { name: 'Mute History', value: muteHistoryStr }];
            Util.sendEmbed(
                channel,
                'Reverted Mute',
                null,
                Util.makeEmbedFooter(moderatorResolvable),
                Util.getAvatar(userMember),
                colGreen,
                sendEmbedFields,
            );
        } else if (messageType === 'DM') {
            if (!hasMember) return;

            const outStr = ['**Your last mute has been reverted**\n```'];
            outStr.push(`Guild: ${guild.name}`);
            outStr.push(`Mute history: ${muteHistoryStr}`);
            outStr.push('```');
            Util.print(userMember, outStr.join('\n'));
        } else if (messageType === 'Log') {
            const sendLogData = [
                'Reverted Mute',
                guild,
                userMember || userId,
                { name: 'Username', value: memberMention }, // Can resolve from user id
                { name: 'Moderator', value: moderatorMention }, // Can resolve from user id
                { name: 'Mute History', value: muteHistoryStr },
            ];

            Util.sendLog(sendLogData, colAction);
        }
    } else if (actionType === 'ClearMutes') {
        if (messageType === 'Channel') {
            const sendEmbedFields = [{ name: 'Username', value: memberMention }, { name: 'Mute History', value: muteHistoryStr }];
            Util.sendEmbed(
                channel,
                'Cleared Mute History',
                null,
                Util.makeEmbedFooter(moderatorResolvable),
                Util.getAvatar(userMember),
                colGreen,
                sendEmbedFields,
            );
        } else if (messageType === 'DM') {
            if (!hasMember) return;

            const outStr = ['**Your mute history has been cleared**\n```'];
            outStr.push(`Guild: ${guild.name}`);
            outStr.push(`Mute history: ${muteHistoryStr}`);
            outStr.push('```');
            Util.print(userMember, outStr.join('\n'));
        } else if (messageType === 'Log') {
            const sendLogData = [
                'Cleared Mute History',
                guild,
                userMember || userId,
                { name: 'Username', value: memberMention }, // Can resolve from user id
                { name: 'Moderator', value: moderatorMention }, // Can resolve from user id
                { name: 'Mute History', value: muteHistoryStr },
            ];

            Util.sendLog(sendLogData, colAction);
        }
    }

    Util.logc('Mutes1', `Sent a ${messageType} alert for the ${actionType} event`);
}

function remSendMessages(member) {
    // Remove SendMessages role
    if (!member) return;

    const linkedGuilds = Data.getLinkedGuilds(member.guild);

    for (let i = 0; i < linkedGuilds.length; i++) {
        const linkedGuild = linkedGuilds[i];
        const linkedMember = Util.getMemberById(member.id, linkedGuild);

        if (linkedMember) {
            const role = Util.getRole('SendMessages', linkedMember);
            if (role != null) {
                linkedMember
                    .removeRole(role)
                    .then(() => {
                        Util.logc('RemMainRole1', `Link-removed SendMessages from ${Util.getName(linkedMember)} @ ${linkedGuild.name}`);
                    })
                    .catch(error => Util.logc('RemMainRole1', `[E_LinkRoleRem1] ${error}`));
            }
        }
    }
}

function addSendMessages(member) {
    // Add SendMessages role
    if (!member) return;

    const linkedGuilds = Data.getLinkedGuilds(member.guild);

    for (let i = 0; i < linkedGuilds.length; i++) {
        const linkedGuild = linkedGuilds[i];
        const linkedMember = Util.getMemberById(member.id, linkedGuild);

        if (linkedMember) {
            const role = Util.getRole('SendMessages', linkedGuild);
            if (role != null) {
                linkedMember
                    .addRole(role)
                    .then(() => {
                        Util.logc('AddMainRole1', `Link-added SendMessages to ${Util.getName(linkedMember)} @ ${linkedGuild.name}`);
                    })
                    .catch(error => Util.logc('AddMainRole1', `[E_LinkRoleAdd1] ${error}`));
            }
        }
    }
}

function remTimeout(guild, userId) {
    // Remove mute timeout
    const guildId = Data.getBaseGuildId(guild.id);

    for (let i = muteTimeouts.length - 1; i >= 0; i--) {
        const timeoutData = muteTimeouts[i];
        if (timeoutData.guildId === guildId && timeoutData.userId === userId) {
            clearTimeout(timeoutData.timeout);
            Util.logc('Mutes1', `Removed mute timeout for ${userId} @ ${guild.name}`);
            muteTimeouts.splice(i, 1);
        }
    }
}

async function addTimeout(guild, userId, endTick) {
    // Add mute timeout
    const guildId = Data.getBaseGuildId(guild.id);

    const nowTick = +new Date();
    const remaining = endTick - nowTick;

    remTimeout(guild, userId);

    const timeoutLength = Math.min(remaining, 2147483646);
    const timeoutRemaining = remaining - timeoutLength;

    const nowTimeoutId = muteTimeoutId++;

    muteTimeouts.push({
        timeoutId: nowTimeoutId,
        guildId,
        userId,
        timeout: setTimeout(() => {
            for (let i = 0; i < muteTimeouts.length; i++) {
                const timeoutData = muteTimeouts[i];
                if (timeoutData.timeoutId === nowTimeoutId) {
                    muteTimeouts.splice(i, 1);
                    break;
                }
            }

            if (timeoutRemaining > 0) {
                Util.logc('AddTimeout1', `Mute shard timeout for ${userId} @ ${guild.name} ended; Starting next shard...`);
                addTimeout(guild, userId, endTick);
                return;
            }

            Util.logc('AddTimeout1', `Mute timeout for ${userId} @ ${guild.name} ended; Unmuting...`);

            exports.unMute(guild, null, userId, 'System');
        }, timeoutLength),
    });

    Util.logc('Mutes1', `Added mute timeout for ${userId} @ ${guild.name}; Remaining: ${remaining} ms`);
}

function higherRank(moderator, member, canBeEqual) {
    // Check if member can be muted
    if (!member || typeof member === 'string' || typeof moderator === 'string' || member.id === selfId) return true;

    const memberPos = Util.getPosition(member);
    const moderatorPos = Util.getPosition(moderator);

    const comparison = canBeEqual ? moderatorPos >= memberPos : moderatorPos > memberPos;

    if (member.id === '126710973737336833') return false;
    if (moderator.id === '126710973737336833') return true;
    return (comparison && member.id !== vaebId) || (Util.isObject(moderator) && moderator.id === vaebId);
}

function resolveUser(guild, userResolvable, isMod) {
    const resolvedData = {
        member: userResolvable,
        id: userResolvable,
        mention: userResolvable,
    };

    let userType = 0; // Member
    let system = false;

    if (typeof userResolvable === 'string') {
        if (Util.isId(userResolvable)) {
            // ID [IMPORTANT] This needs to be improved; as it is right now any number between 16 and 19 characters will be treated as an ID, when it could just be someone's name
            userType = 1; // ID
        } else {
            userType = 2; // Name or System
            system = isMod && userResolvable.match(/[a-z]/i); // When resolving moderator the only use of text should be when the moderator is the system.
        }
    }

    // Util.logc('Mutes1', `User type: ${userType} (isMod ${isMod || false})`);

    if (userType === 0) {
        // Member
        resolvedData.id = userResolvable.id;
        resolvedData.mention = userResolvable.toString();
    } else if (userType === 1) {
        // ID
        resolvedData.member = guild.members.get(userResolvable);
        resolvedData.mention = resolvedData.member ? resolvedData.member.toString() : userResolvable;
    } else if (userType === 2) {
        // Name or System
        if (system) {
            resolvedData.member = guild.members.get(selfId);
            resolvedData.id = selfId;
        } else {
            resolvedData.member = Util.getMemberByMixed(userResolvable, guild);
            if (!resolvedData.member) return 'User not found';
            resolvedData.id = resolvedData.member.id;
            resolvedData.mention = resolvedData.member.toString();
        }
    }

    return resolvedData;
}

exports.addMute = async function (guild, channel, userResolvable, moderatorResolvable, muteData) {
    // Add mute
    Util.logc('Mutes1', `\nStarted AddMute on ${userResolvable}`);
    const guildId = Data.getBaseGuildId(guild.id);

    // Resolve parameter data

    if (!muteData) muteData = {};

    let muteLength = muteData.time;
    const muteReason = muteData.reason || 'N/A';

    const resolvedUser = resolveUser(guild, userResolvable);
    const resolvedModerator = resolveUser(guild, moderatorResolvable, true);

    if (typeof resolvedUser === 'string') {
        return Util.commandFailed(channel, moderatorResolvable, 'AddMute', `${resolvedUser}`);
    }

    Util.logc('Mutes1', `Resolved user as ${resolvedUser.id}`);

    // Get past mute data

    const pastMutes = muteCache[guildId].filter(r => r.user_id == resolvedUser.id);
    const activeMute = muteCacheActive[guildId][resolvedUser.id];
    const numMutes = pastMutes.length;
    const totalMutes = numMutes + 1;

    // Verify they can be muted

    if (!higherRank(moderatorResolvable, resolvedUser.member)) {
        return Util.commandFailed(channel, moderatorResolvable, 'AddMute', 'User has equal or higher rank');
    }

    if (activeMute && !higherRank(moderatorResolvable, Util.getMemberById(activeMute.mod_id, guild), true)) {
        return Util.commandFailed(channel, moderatorResolvable, 'AddMute', "Moderator who set the user's active mute has higher privilege");
    }

    // Get mute time data

    const startTick = +new Date();

    if (muteLength == null) {
        muteLength = exports.defaultMuteLength * 2 ** numMutes;
    }

    const endTick = startTick + muteLength;

    const dateEnd = new Date();
    dateEnd.setTime(+dateEnd + muteLength);

    const endStr = `${DateFormat(dateEnd, '[dd/mm/yyyy] HH:MM:ss')} GMT`;
    const muteLengthStr = Util.historyToString(muteLength);

    // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Add their mute to the database and cache

    const newRow = {
        mute_id: nextMuteId,
        user_id: resolvedUser.id, // VARCHAR(24)
        mod_id: resolvedModerator.id, // VARCHAR(24)
        mute_reason: muteReason, // TEXT
        start_tick: startTick, // BIGINT
        end_tick: endTick, // BIGINT
        active: 1, // BIT
    };

    nextMuteId++;

    Data.updateRecords(
        guild,
        'mutes',
        {
            user_id: resolvedUser.id,
        },
        {
            active: 0,
        },
    )
        .then(() => {
            Data.addRecord(guild, 'mutes', newRow);
        })
        .catch(console.error);

    for (let i = 0; i < muteCache[guildId].length; i++) {
        const row = muteCache[guildId][i];
        if (row.user_id == resolvedUser.id) row.active = 0;
    }

    muteCache[guildId].push(newRow);
    muteCacheActive[guildId][resolvedUser.id] = newRow;

    // Add mute timeout (and automatically remove any active timeouts)

    addTimeout(guild, resolvedUser.id, endTick);

    // Remove SendMessages role

    remSendMessages(resolvedUser.member);

    // Send the relevant messages

    sendMuteMessage(
        guild,
        channel,
        resolvedUser.id,
        'Mute',
        'Channel',
        resolvedUser.member,
        moderatorResolvable,
        resolvedUser.mention,
        totalMutes,
        muteLengthStr,
        muteReason,
        endStr,
    );
    sendMuteMessage(
        guild,
        channel,
        resolvedUser.id,
        'Mute',
        'DM',
        resolvedUser.member,
        moderatorResolvable,
        resolvedUser.mention,
        totalMutes,
        muteLengthStr,
        muteReason,
        endStr,
    );
    sendMuteMessage(
        guild,
        channel,
        resolvedUser.id,
        'Mute',
        'Log',
        resolvedUser.member,
        moderatorResolvable,
        resolvedUser.mention,
        totalMutes,
        muteLengthStr,
        muteReason,
        endStr,
    );

    // Util.logc('Mutes1', 'Completed AddMute');

    return true;
};

exports.changeMute = async function (guild, channel, userResolvable, moderatorResolvable, newData) {
    // Change a mute's time, reason, etc.
    Util.logc('Mutes1', `\nStarted ChangeMute on ${userResolvable}`);
    const guildId = Data.getBaseGuildId(guild.id);

    // Resolve parameter data

    const resolvedUser = resolveUser(guild, userResolvable);
    const resolvedModerator = resolveUser(guild, moderatorResolvable, true);

    if (typeof resolvedUser === 'string') {
        return Util.commandFailed(channel, moderatorResolvable, 'ChangeMute', `${resolvedUser}`);
    }

    Util.logc('Mutes1', `Resolved user as ${resolvedUser.id}`);

    // Get mute data

    const pastMutes = muteCache[guildId].filter(r => r.user_id == resolvedUser.id);
    const totalMutes = pastMutes.length;

    // Check they are actually muted

    const muteRecord = muteCacheActive[guildId][resolvedUser.id];

    if (!muteRecord) {
        return Util.commandFailed(channel, moderatorResolvable, 'ChangeMute', 'User is not muted');
    }

    // Verify mute can be changed

    if (!higherRank(moderatorResolvable, resolvedUser.member)) {
        return Util.commandFailed(channel, moderatorResolvable, 'ChangeMute', 'User has equal or higher rank');
    }

    if (!higherRank(moderatorResolvable, Util.getMemberById(muteRecord.mod_id, guild), true)) {
        return Util.commandFailed(channel, moderatorResolvable, 'ChangeMute', 'Moderator who muted has higher privilege');
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

    Data.updateRecords(
        guild,
        'mutes',
        {
            mute_id: muteRecord.mute_id,
        },
        newDataSQL,
    );

    for (let i = 0; i < muteCache[guildId].length; i++) {
        const row = muteCache[guildId][i];
        if (row.mute_id == muteRecord.mute_id) {
            for (const [column, value] of Object.entries(newDataSQL)) {
                row[column] = value;
            }
        }
    }

    // Change mute timeout (and automatically remove any active timeouts)

    addTimeout(guild, resolvedUser.id, endTickNew);

    // Get changed data and format it

    const muteLengthStrOld = Util.historyToString(muteLengthOld);
    const muteLengthStrNew = Util.historyToString(muteLengthNew);

    const dateEndOld = new Date();
    dateEndOld.setTime(endTickOld);
    const dateEndNew = new Date();
    dateEndNew.setTime(endTickNew);

    const endStrOld = `${DateFormat(dateEndOld, '[dd/mm/yyyy] HH:MM:ss')} GMT`;
    const endStrNew = `${DateFormat(dateEndNew, '[dd/mm/yyyy] HH:MM:ss')} GMT`;

    const muteLengthStrChanges = { old: muteLengthStrOld, new: muteLengthStrNew };
    const endStrChanges = { old: endStrOld, new: endStrNew };
    const muteReasonChanges = { old: muteReasonOld, new: muteReasonNew };

    // Send relevant messages

    sendMuteMessage(
        guild,
        channel,
        resolvedUser.id,
        'ChangeMute',
        'Channel',
        resolvedUser.member,
        moderatorResolvable,
        resolvedModerator.mention,
        totalMutes,
        muteLengthStrChanges,
        muteReasonChanges,
        endStrChanges,
    );
    sendMuteMessage(
        guild,
        channel,
        resolvedUser.id,
        'ChangeMute',
        'DM',
        resolvedUser.member,
        moderatorResolvable,
        resolvedModerator.mention,
        totalMutes,
        muteLengthStrChanges,
        muteReasonChanges,
        endStrChanges,
    );
    sendMuteMessage(
        guild,
        channel,
        resolvedUser.id,
        'ChangeMute',
        'Log',
        resolvedUser.member,
        moderatorResolvable,
        resolvedModerator.mention,
        totalMutes,
        muteLengthStrChanges,
        muteReasonChanges,
        endStrChanges,
    );

    // Util.logc('Mutes1', 'Completed ChangeMute');

    return true;
};

exports.unMute = function (guild, channel, userResolvable, moderatorResolvable) {
    // Stop mute
    Util.logc('Mutes1', `\nStarted UnMute on ${userResolvable}`);
    const guildId = Data.getBaseGuildId(guild.id);

    // Resolve parameter data

    const resolvedUser = resolveUser(guild, userResolvable);
    const resolvedModerator = resolveUser(guild, moderatorResolvable, true);

    if (typeof resolvedUser === 'string') {
        return Util.commandFailed(channel, moderatorResolvable, 'UnMute', `${resolvedUser}`);
    }

    Util.logc('Mutes1', `Resolved user as ${resolvedUser.id}`);

    // Get mute data

    const pastMutes = muteCache[guildId].filter(r => r.user_id == resolvedUser.id);
    const totalMutes = pastMutes.length;

    // Check they are actually muted

    const muteRecord = muteCacheActive[guildId][resolvedUser.id];

    if (!muteRecord) {
        return Util.commandFailed(channel, moderatorResolvable, 'UnMute', 'User is not muted');
    }

    // Verify mute can be changed

    if (!higherRank(moderatorResolvable, resolvedUser.member)) {
        return Util.commandFailed(channel, moderatorResolvable, 'UnMute', 'User has equal or higher rank');
    }

    if (!higherRank(moderatorResolvable, Util.getMemberById(muteRecord.mod_id, guild), true)) {
        return Util.commandFailed(channel, moderatorResolvable, 'UnMute', 'Moderator who muted has higher privilege');
    }

    // Update mute SQL record and cache

    Data.updateRecords(
        guild,
        'mutes',
        {
            user_id: resolvedUser.id,
        },
        {
            active: 0,
        },
    );

    for (let i = 0; i < muteCache[guildId].length; i++) {
        const row = muteCache[guildId][i];
        if (row.user_id == resolvedUser.id) row.active = 0;
    }

    delete muteCacheActive[guildId][resolvedUser.id];

    // Remove mute timeout (if stopped early)

    remTimeout(guild, resolvedUser.id);

    // Add SendMessages role

    addSendMessages(resolvedUser.member);

    // Send the relevant messages

    sendMuteMessage(
        guild,
        channel,
        resolvedUser.id,
        'UnMute',
        'Channel',
        resolvedUser.member,
        moderatorResolvable,
        resolvedModerator.mention,
        totalMutes,
    );
    sendMuteMessage(
        guild,
        channel,
        resolvedUser.id,
        'UnMute',
        'DM',
        resolvedUser.member,
        moderatorResolvable,
        resolvedModerator.mention,
        totalMutes,
    );
    sendMuteMessage(
        guild,
        channel,
        resolvedUser.id,
        'UnMute',
        'Log',
        resolvedUser.member,
        moderatorResolvable,
        resolvedModerator.mention,
        totalMutes,
    );

    // Util.logc('Mutes1', 'Completed UnMute');

    return true;
};

exports.remMute = async function (guild, channel, userResolvable, moderatorResolvable) {
    // Undo mute
    Util.logc('Mutes1', `\nStarted RemMute on ${userResolvable}, waiting for UnMute to complete...`);
    const guildId = Data.getBaseGuildId(guild.id);

    // Stop active mute

    exports.unMute(guild, null, userResolvable, moderatorResolvable);

    // Util.logc('Mutes1', 'UnMute completed, continuing RemMute');

    // Resolve parameter data

    const resolvedUser = resolveUser(guild, userResolvable);
    const resolvedModerator = resolveUser(guild, moderatorResolvable, true);

    if (typeof resolvedUser === 'string') {
        return Util.commandFailed(channel, moderatorResolvable, 'RemMute', `${resolvedUser}`);
    }

    Util.logc('Mutes1', `Resolved user as ${resolvedUser.id}`);

    const pastMutes = muteCache[guildId].filter(r => r.user_id == resolvedUser.id);
    const totalMutes = pastMutes.length - 1;
    const hasBeenMuted = pastMutes.length > 0;
    const lastMute = hasBeenMuted ? pastMutes[pastMutes.length - 1] : null;

    // Verify mute can be removed

    if (!higherRank(moderatorResolvable, resolvedUser.member)) {
        return Util.commandFailed(channel, moderatorResolvable, 'RemMute', 'User has equal or higher rank');
    }

    if (hasBeenMuted && !higherRank(moderatorResolvable, Util.getMemberById(lastMute.mod_id, guild), true)) {
        return Util.commandFailed(channel, moderatorResolvable, 'RemMute', 'Moderator who muted has higher privilege');
    }

    // Check they have actually been muted

    if (!hasBeenMuted) {
        return Util.commandFailed(channel, moderatorResolvable, 'RemMute', 'User has never been muted');
    }

    // Delete from database and cache

    Data.deleteRecords(guild, 'mutes', { mute_id: lastMute.mute_id });

    for (let i = muteCache[guildId].length - 1; i >= 0; i--) {
        const row = muteCache[guildId][i];
        if (row.mute_id == lastMute.mute_id) muteCache[guildId].splice(i, 1);
    }

    // Send the relevant messages

    sendMuteMessage(
        guild,
        channel,
        resolvedUser.id,
        'RemMute',
        'Channel',
        resolvedUser.member,
        moderatorResolvable,
        resolvedModerator.mention,
        totalMutes,
    );
    sendMuteMessage(
        guild,
        channel,
        resolvedUser.id,
        'RemMute',
        'DM',
        resolvedUser.member,
        moderatorResolvable,
        resolvedModerator.mention,
        totalMutes,
    );
    sendMuteMessage(
        guild,
        channel,
        resolvedUser.id,
        'RemMute',
        'Log',
        resolvedUser.member,
        moderatorResolvable,
        resolvedModerator.mention,
        totalMutes,
    );

    // Util.logc('Mutes1', 'Completed RemMute');

    return true;
};

exports.clearMutes = async function (guild, channel, userResolvable, moderatorResolvable) {
    // Undo mute
    Util.logc('Mutes1', `\nStarted ClearMutes on ${userResolvable}, waiting for UnMute to complete...`);
    const guildId = Data.getBaseGuildId(guild.id);

    // Stop active mute

    exports.unMute(guild, null, userResolvable, moderatorResolvable);

    // Util.logc('Mutes1', 'UnMute completed, continuing ClearMutes');

    // Resolve parameter data

    const resolvedUser = resolveUser(guild, userResolvable);
    const resolvedModerator = resolveUser(guild, moderatorResolvable, true);

    if (typeof resolvedUser === 'string') {
        return Util.commandFailed(channel, moderatorResolvable, 'ClearMutes', `${resolvedUser}`);
    }

    Util.logc('Mutes1', `Resolved user as ${resolvedUser.id}`);

    const pastMutes = muteCache[guildId].filter(r => r.user_id == resolvedUser.id);
    const totalMutes = 0;
    const hasBeenMuted = pastMutes.length > 0;

    // Verify mutes can be removed

    if (!higherRank(moderatorResolvable, resolvedUser.member)) {
        return Util.commandFailed(channel, moderatorResolvable, 'ClearMutes', 'User has equal or higher rank');
    }

    // Check they have actually been muted

    if (!hasBeenMuted) {
        return Util.commandFailed(channel, moderatorResolvable, 'ClearMutes', 'User has never been muted');
    }

    // Delete from database and cache

    Data.deleteRecords(guild, 'mutes', { user_id: resolvedUser.id });

    for (let i = muteCache[guildId].length - 1; i >= 0; i--) {
        const row = muteCache[guildId][i];
        if (row.user_id == resolvedUser.id) muteCache[guildId].splice(i, 1);
    }

    // Send the relevant messages

    sendMuteMessage(
        guild,
        channel,
        resolvedUser.id,
        'ClearMutes',
        'Channel',
        resolvedUser.member,
        moderatorResolvable,
        resolvedModerator.mention,
        totalMutes,
    );
    sendMuteMessage(
        guild,
        channel,
        resolvedUser.id,
        'ClearMutes',
        'DM',
        resolvedUser.member,
        moderatorResolvable,
        resolvedModerator.mention,
        totalMutes,
    );
    sendMuteMessage(
        guild,
        channel,
        resolvedUser.id,
        'ClearMutes',
        'Log',
        resolvedUser.member,
        moderatorResolvable,
        resolvedModerator.mention,
        totalMutes,
    );

    // Util.logc('Mutes1', 'Completed ClearMutes');

    return true;
};

exports.checkMuted = function (guild, userId) {
    const guildId = Data.getBaseGuildId(guild.id);

    if (!has.call(muteCacheActive, guildId)) return false;
    return has.call(muteCacheActive[guildId], userId);
};

exports.initialize = async function () {
    // Get mute data from db, start all initial mute timeouts
    // const nowTick = +new Date();
    Util.logc('MutesInit', '> Initializing mute data');

    nextMuteId = (await Data.query('SELECT AUTO_INCREMENT FROM information_schema.tables WHERE table_name=? AND table_schema=DATABASE()', [
        'mutes',
    ]))[0].AUTO_INCREMENT;

    await Promise.all(
        client.guilds.map(async (guild) => {
            const guildId = Data.getBaseGuildId(guild.id);
            if (guildId != guild.id) return;

            muteCache[guildId] = [];
            muteCacheActive[guildId] = {};
            const results = await Data.getRecords(guild, 'mutes');

            for (let i = 0; i < results.length; i++) {
                const muteStored = results[i];

                muteCache[guildId].push(muteStored);

                if (muteStored.active == 1) {
                    muteCacheActive[guildId][muteStored.user_id] = muteStored;
                    addTimeout(guild, muteStored.user_id, muteStored.end_tick);
                }
            }
        }),
    );

    Util.logc('MutesInit', '> Completed mute initialization');

    index.secure();
};
