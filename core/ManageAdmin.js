const timeouts = {
    mute: [],
    ban: [],
};

let timeoutId = 0;

const muteCacheActive = {};

exports.defaultMuteLength = 1000 * 60 * 30;
exports.defaultMuteLength2 = 1000 * 60 * 60 * 24;
exports.dayMilli = 86400000;

exports.badOffenses = [
    { offense: 'Posting nsfw images', time: 1000 * 60 * 60 * 24 * 1 },
    { offense: 'Posting nsfw images with VaeBot', time: 1000 * 60 * 60 * 24 * 2 },
    { offense: 'Sending dangerous files', time: 1000 * 60 * 60 * 24 * 3.5 },
    { offense: 'Genuine scamming', time: 1000 * 60 * 60 * 24 * 7 },
];

/*

    -Mutes have an optional set_mute_time parameter
    -When muted without it, user will be muted 2^(pastMutes-1), including mutes with set_mute_time (but not affect by their mute time)
    -IncMute/DecMute can specify how many times the mute time should be doubled (acts like set_mute_time in not affecting the next mute)
    -ChangeMute command to change mute time, reason, etc.
    -Warn can mute a user for any amount of time, but defaults to 0.5 hours (and does not affect next mute time)

    -Moderators with lower or equal privilege can only change/readd a mute if the mute time is higher or equal

*/

function getHistoryStr(action, totalMutes) {
    let out = `${totalMutes} ${action.match(/[A-Z][a-z]+$/)[0]}`;
    if (totalMutes !== 1 && out[out.length - 1] !== 's') out += 's';
    return out.toLowerCase();
}

function sendAlertChannel(action, guild, channel, resolvedUser, resolvedModerator, extra) {
    const sendEmbedFields = [
        { name: 'User', value: resolvedUser.mention },
        !extra.end ? { inline: false, name: 'Reason', value: extra.reason } : {},
        !extra.end ? { name: 'Length', value: extra.lengthStr } : {},
        !extra.end ? { name: 'Expires', value: extra.endStr } : {},
        extra.end ? { name: 'History', value: extra.historyStr } : {},
    ];
    Util.sendDescEmbed(
        channel,
        `User ${extra.actionPast}`,
        Util.fieldsToDesc(sendEmbedFields),
        Util.makeEmbedFooter(resolvedModerator.original),
        Util.getAvatar(resolvedUser.member),
        colGreen,
    );
}

function sendAlertDM(action, guild, channel, resolvedUser, resolvedModerator, extra) {
    if (!resolvedUser.member || action == 'Ban' || action == 'TempBan') return;

    const outStr = [`**You have been ${extra.actionPast.toLowerCase()}**\n\`\`\``];
    outStr.push(`Guild: ${guild.name}`);
    if (!extra.end) outStr.push(`Reason: ${extra.reason}`);
    if (!extra.end) outStr.push(`$Length: ${extra.lengthStr}`);
    if (!extra.end) outStr.push(`Expires: ${extra.endStr}`);
    outStr.push(`${action} history: ${extra.historyStr}`);
    outStr.push('```');
    Util.print(resolvedUser.member, outStr.join('\n'));
}

function sendAlertLog(action, guild, channel, resolvedUser, resolvedModerator, extra) {
    const sendLogData = [
        `User ${extra.actionPast}`,
        guild,
        resolvedUser.member || resolvedUser.id,
        { name: 'Username', value: resolvedUser.mention }, // Can resolve from user id
        { name: 'Moderator', value: resolvedModerator.mention },
        !extra.end ? { inline: false, name: `${action} Reason`, value: extra.reason } : {},
        !extra.end ? { name: `${action} Length`, value: extra.lengthStr } : {},
        !extra.end ? { name: `${action} Expires`, value: extra.endStr } : {},
        { name: `${action} History`, value: extra.historyStr },
    ];

    Util.sendLog(sendLogData, colAction);
}

// function sendAlert(guild, channel, userId, actionType, messageType, userMember, moderatorResolvable, moderatorMention, totalMutes, muteLengthStr, muteReason, endStr) { // Send mute log, direct message, etc.
/* function sendAlert(guild, channel, resolvedUser.id, action, null, resolvedUser.member,
    resolvedModerator.original, resolvedModerator.mention, extra.total, extra.lengthStr, extra.reason,
    extra.endStr) */

/*

    extra: { actionPast, end, total, lengthStr, reason, endStr }

*/

function sendAlert(tag, guild, channel, resolvedUser, resolvedModerator, extra) {
    // Send mute log, direct message, etc.
    // Will keep DM as text (rather than embed) to save send time

    extra.historyStr = getHistoryStr(tag, extra.total);

    const action = tag.match(/[A-Z][a-z]+$/)[0];

    if (tag === 'ChangeMute') {
        let fieldsChanged = [];

        if (extra.reason.new != extra.reason.old) fieldsChanged.push(`${action} Reason`);
        if (extra.lengthStr.new != extra.lengthStr.old) fieldsChanged.push(`${action} Length`);

        // const fieldsChangedArr = fieldsChanged;
        fieldsChanged = fieldsChanged.join(', ');

        const sendEmbedFields = [{ name: 'Username', value: resolvedUser.mention }, { name: 'Fields Changed', value: fieldsChanged }];

        if (extra.reason.new != extra.reason.old) {
            sendEmbedFields.push({ name: `Old ${action} Reason`, value: extra.reason.old });
            sendEmbedFields.push({ name: `New ${action} Reason`, value: extra.reason.new });
        }

        if (extra.lengthStr.new != extra.lengthStr.old) {
            sendEmbedFields.push({ name: `Old ${action} Length`, value: extra.lengthStr.old });
            sendEmbedFields.push({ name: `New ${action} Length`, value: extra.lengthStr.new });
        }

        Util.sendEmbed(
            channel,
            `${action} Changed`,
            null,
            Util.makeEmbedFooter(resolvedModerator.original),
            Util.getAvatar(resolvedUser.member),
            colGreen,
            sendEmbedFields,
        );

        if (resolvedUser.member) {
            const outStr = [`**Your ${action.toLowerCase()} has been changed**\n\`\`\``];
            outStr.push(`Guild: ${guild.name}`);
            if (extra.reason.new != extra.reason.old) {
                outStr.push(`Old ${action} reason: ${extra.reason.old} | New ${action} reason: ${extra.reason.new}`);
            }
            if (extra.lengthStr.new != extra.lengthStr.old) {
                outStr.push(`Old ${action} length: ${extra.lengthStr.old} | New ${action} length: ${extra.lengthStr.new}`);
            }
            if (extra.endStr.new != extra.endStr.old) {
                outStr.push(`Old ${action} expiration: ${extra.endStr.old} | New ${action} expiration: ${extra.endStr.new}`);
            }
            outStr.push('```');
            Util.print(resolvedUser.member, outStr.join('\n'));
        }

        const sendLogData = [
            `${action} Changed`,
            guild,
            resolvedUser.member || resolvedUser.id,
            { name: 'Username', value: resolvedUser.mention },
            { name: 'Moderator', value: resolvedModerator.mention },
            { name: `Old ${action} Reason`, value: extra.reason.old },
            { name: `New ${action} Reason`, value: extra.reason.new },
            { name: `Old ${action} Length`, value: extra.lengthStr.old },
            { name: `New ${action} Length`, value: extra.lengthStr.new },
            { name: `Old ${action} Expires`, value: extra.endStr.old },
            { name: `New ${action} Expires`, value: extra.endStr.new },
            { name: `${action} History`, value: extra.historyStr },
        ];

        Util.sendLog(sendLogData, colAction);
    } else {
        sendAlertChannel(action, guild, channel, resolvedUser, resolvedModerator, extra);
        if (!index.raidMode[guild.id]) sendAlertDM(action, guild, channel, resolvedUser, resolvedModerator, extra);
        sendAlertLog(action, guild, channel, resolvedUser, resolvedModerator, extra);
    }

    // Util.logc('Admin1', `Sent alerts for the ${tag} event`);
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

function remTimeout(guild, userId, offenseTag) {
    // Remove mute timeout
    const guildId = Data.getBaseGuildId(guild.id);

    offenseTag = offenseTag.toLowerCase();
    const nowTimeouts = timeouts[offenseTag];

    for (let i = nowTimeouts.length - 1; i >= 0; i--) {
        const timeoutData = nowTimeouts[i];
        if (timeoutData.guildId === guildId && timeoutData.userId === userId) {
            clearTimeout(timeoutData.timeout);
            Util.logc('Admin1', `Removed timeout for ${userId} @ ${guild.name}`);
            nowTimeouts.splice(i, 1);
        }
    }
}

async function addTimeout(guild, userId, endTick, offenseTag) {
    // Add mute/tempban timeout
    const guildId = Data.getBaseGuildId(guild.id);

    offenseTag = offenseTag.toLowerCase();
    const nowTimeouts = timeouts[offenseTag];

    const nowTick = +new Date();
    const remaining = endTick - nowTick;

    remTimeout(guild, userId, offenseTag);

    const timeoutLength = Math.min(remaining, 2147483646);
    const timeoutRemaining = remaining - timeoutLength;

    const nowTimeoutId = timeoutId++;

    nowTimeouts.push({
        timeoutId: nowTimeoutId,
        guildId,
        userId,
        timeout: setTimeout(() => {
            for (let i = 0; i < nowTimeouts.length; i++) {
                const timeoutData = nowTimeouts[i];
                if (timeoutData.timeoutId === nowTimeoutId) {
                    nowTimeouts.splice(i, 1);
                    break;
                }
            }

            if (timeoutRemaining > 0) {
                Util.logc('AddTimeout1', `Shard timeout for ${userId} @ ${guild.name} ended; Starting next shard...`);
                addTimeout(guild, userId, endTick, offenseTag);
                return;
            }

            Util.logc('AddTimeout1', `Timeout for ${userId} @ ${guild.name} ended; Ending offense...`);

            if (offenseTag == 'mute') {
                exports.unMute(guild, null, userId, 'System');
            } else if (offenseTag == 'ban') {
                exports.unBan(guild, null, userId, 'System');
            }
        }, timeoutLength),
    });

    Util.logc('Admin1', `Added offense timeout for ${userId} @ ${guild.name}; Remaining: ${remaining} ms`);
}

function higherRank(moderator, member, canBeEqual) {
    // Check if member can be muted
    if (!moderator) return false;
    if (!member || typeof moderator === 'string' || typeof member === 'string' || moderator.id === selfId || member.id === selfId) {
        return true;
    }

    const memberPos = Util.getPosition(member);
    const moderatorPos = Util.getPosition(moderator);

    const comparison = canBeEqual ? moderatorPos >= memberPos : moderatorPos > memberPos;

    if (member.id === '126710973737336833') return false;
    if (moderator.id === '126710973737336833') return true;
    return (comparison && member.id !== vaebId) || (Util.isObject(moderator) && moderator.id === vaebId);
}

function notHigherRank(moderator, member, notEqual) {
    return !higherRank(moderator, member, notEqual);
}

function getMinTime(time, maxTime) {
    // return time ? Math.min(time, maxTime) : maxTime;
    return time != null ? time : maxTime;
}

function getDefaultMuteTime(pastMutesCount) {
    return pastMutesCount < 7
        ? exports.defaultMuteLength * 2 ** pastMutesCount
        : exports.defaultMuteLength2 * 3 + exports.defaultMuteLength2 * (pastMutesCount - 7) * 1;
}

function getNextMuteTime(time, muteReason, pastMutes) {
    if (!muteReason) muteReason = '';

    let maxMuteLength = getDefaultMuteTime(pastMutes);
    const maxMuteLengthIndex = Number((/^\[(\d+)\]/.exec(muteReason) || [])[1]);

    if (!isNaN(maxMuteLengthIndex) && maxMuteLengthIndex < exports.badOffenses.length) {
        maxMuteLength = Math.max(maxMuteLength, exports.badOffenses[maxMuteLengthIndex].time);
    }

    return getMinTime(time, maxMuteLength);
}

async function getNextMuteTimeFromUser(guild, userResolvable, time, muteReason) {
    if (Util.isObject(userResolvable)) userResolvable = userResolvable.id;
    const pastMutes = (await Data.getRecords(guild, 'mutes', { user_id: userResolvable })).length;

    return getNextMuteTime(time, muteReason, pastMutes);
}

function unBanMember(guild, channel, resolvedUser, resolvedModerator, extra) {
    const tempStr = extra.temp ? 'Temp' : '';

    const linkedGuilds = Data.getLinkedGuilds(guild);

    for (let i = 0; i < linkedGuilds.length; i++) {
        const linkedGuild = linkedGuilds[i];
        linkedGuild
            .unban(resolvedUser.id)
            .then((user) => {
                Util.logc('RemoveBan1', `Link-removed ban for ${Util.getMention(user, true)} @ ${linkedGuild.name}`);
            })
            .catch(error => Util.logc('RemoveBan1', `[E_LinkRoleAdd1] ${error}`));
    }

    // Send the relevant messages

    sendAlert(`Un${tempStr}Ban`, guild, channel, resolvedUser, resolvedModerator, {
        actionPast: 'Unbanned',
        end: true,
        total: extra.totalBans,
    });
}

async function banMember(guild, channel, resolvedUser, resolvedModerator, reason, extra) {
    const tempStr = extra.temp ? 'Temp' : '';
    const action = `${tempStr}Ban`;
    const actionPast = `${extra.temp ? 'Temp ' : ''}Banned`;
    const endStr = has.call(extra, 'dateEnd') ? Util.getDateString(extra.dateEnd) : 'Never';

    const memberName = resolvedUser.member ? Util.getFullName(resolvedUser.member) : resolvedUser.mention;
    const moderatorName = resolvedModerator.member ? Util.getFullName(resolvedModerator.member) : resolvedModerator.mention;

    // Ban the user in all linked guilds

    if (resolvedUser.member /* && extra.temp */) {
        const outStr = [`**You have been ${actionPast.toLowerCase()}**\n\`\`\``];
        outStr.push(`Guild: ${guild.name}`);
        outStr.push(`Reason: ${reason}`);
        outStr.push(`Length: ${extra.banLengthStr}`);
        outStr.push(`Expires: ${endStr}`);
        outStr.push('```');
        outStr.push('------------------------------------------------------------------------------------');
        outStr.push(
            'Please keep in mind that bots cannot DM users who they do not share a server with, so you will not be notified when your ban ends.',
        );
        outStr.push('------------------------------------------------------------------------------------');
        outStr.push(`${guild.name} invite link: https://discord.gg/bvS5gwY`);
        outStr.push('------------------------------------------------------------------------------------');
        outStr.push(
            'The invite link may still display as **expired** when your ban ends, this is due to Discord caching your ban. If this happens you can try the following:',
        );
        outStr.push('-Option 1: Try using the web version of Discord in an incognito tab.');
        outStr.push('-Option 2: Restart Discord with a VPN active.');
        outStr.push('-Option 3: Fully unplug your modem and leave it disconnected for 6 minutes, then restart your PC.');

        try {
            await Util.print(resolvedUser.member, outStr.join('\n'));
        } catch (err) {
            Util.logErr('Cannot send DMs to this user, continuing the ban process');
        }
    }

    const linkedGuilds = Data.getLinkedGuilds(guild);
    for (let i = 0; i < linkedGuilds.length; i++) {
        const linkedGuild = linkedGuilds[i];
        linkedGuild
            .ban(resolvedUser.id, { days: 0, reason })
            .then((userResolvable) => {
                Util.logc('AddBan1', `Link-added ban for ${Util.getMention(userResolvable, true)} @ ${linkedGuild.name}`);
            })
            .catch(Util.logErr);
    }

    // Send the relevant messages

    sendAlert(action, guild, channel, resolvedUser, resolvedModerator, {
        actionPast,
        end: false,
        total: extra.totalBans,
        lengthStr: extra.banLengthStr,
        reason,
        endStr,
    });

    // Trello.addCard(guild, 'Bans', memberName, {
    //     'User ID': resolvedUser.id,
    //     Moderator: moderatorName,
    //     Reason: `[${extra.temp ? 'Temp' : 'Full'}Ban] ${reason}`,
    // });

    return true;
}

exports.higherRank = higherRank;
exports.notHigherRank = notHigherRank;
exports.getNextMuteTime = getNextMuteTime;
exports.getNextMuteTimeFromUser = getNextMuteTimeFromUser;

exports.addMute = async function (guild, channel, userResolvable, moderatorResolvable, muteData) {
    // Add mute
    Util.logc('Admin1', `\nStarted AddMute on ${userResolvable}`);
    const guildId = Data.getBaseGuildId(guild.id);

    // Resolve parameter data

    if (!muteData) muteData = {};

    let muteLength = muteData.time;
    const muteReason = muteData.reason || 'N/A';

    const resolvedUser = Util.resolveUser(guild, userResolvable);
    const resolvedModerator = Util.resolveUser(guild, moderatorResolvable, true);

    if (typeof resolvedUser === 'string') {
        return Util.commandFailed(channel, moderatorResolvable, 'AddMute', `${resolvedUser}`);
    }

    Util.logc('Admin1', `Resolved user as ${resolvedUser.id}`);

    if (guild.name === 'Sentinel' && resolvedUser.member && Util.checkStaff(guild, resolvedUser.member)) {
        if (resolvedModerator.id != selfId) {
            return Util.commandFailed(channel, moderatorResolvable, 'AddMute', 'Cannot mute staff in this server');
        }

        return false;
    }

    // Get past mute data

    const userMutes = await Data.getRecords(guild, 'mutes', { user_id: resolvedUser.id });
    const activeMute = muteCacheActive[guildId][resolvedUser.id];
    const pastMutes = userMutes.length;
    const totalMutes = pastMutes + 1;

    // Get mute time data

    const startTick = +new Date();

    muteLength = getNextMuteTime(muteLength, muteReason, pastMutes);

    const endTick = startTick + muteLength;

    const dateEnd = new Date();
    dateEnd.setTime(+dateEnd + muteLength);

    const endStr = Util.getDateString(dateEnd);
    const muteLengthStr = Util.historyToString(muteLength);

    // Verify they can be muted

    if (notHigherRank(moderatorResolvable, resolvedUser.member)) {
        return Util.commandFailed(channel, moderatorResolvable, 'AddMute', 'User has equal or higher rank');
    }

    if (
        activeMute &&
        activeMute.mod_id != resolvedModerator.id &&
        notHigherRank(moderatorResolvable, Util.getMemberById(activeMute.mod_id, guild)) &&
        activeMute.end_tick > endTick
    ) {
        return Util.commandFailed(
            channel,
            moderatorResolvable,
            'AddMute',
            "The user is already muted: You can't override a user's mute with an earlier end time unless you have higher privilege than the original moderator",
        );
    }

    // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Add their mute to the database and cache

    const newRow = {
        user_id: resolvedUser.id, // VARCHAR(24)
        mod_id: resolvedModerator.id, // VARCHAR(24)
        mute_reason: muteReason, // TEXT
        start_tick: startTick, // BIGINT
        end_tick: endTick, // BIGINT
        active: 1, // BIT
    };

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

    Data.addRecord(guild, 'mutes', newRow);

    muteCacheActive[guildId][resolvedUser.id] = newRow;

    // Add mute timeout (and automatically remove any active timeouts)

    addTimeout(guild, resolvedUser.id, endTick, 'mute');

    // Remove SendMessages role

    remSendMessages(resolvedUser.member);

    // Send the relevant messages

    sendAlert('Mute', guild, channel, resolvedUser, resolvedModerator, {
        actionPast: 'Muted',
        end: false,
        total: totalMutes,
        lengthStr: muteLengthStr,
        reason: muteReason,
        endStr,
    });

    Util.logc('Admin1', 'Completed AddMute');

    return true;
};

exports.warnStatus = {};

/*
    warnStatus {
        guildId: {
            warnTag {
                userId: {
                    status: 1 // 0 = Not warned, 1 = Was warned recently
                    statusChanged: +new Date() // When the status was last changed or 0
                }
            }
        }
    }

    funcData {
        reason,
        length, // null = 30 minutes, 'next' = Next mute time
    }
*/

exports.addWarning = async function (guild, channel, userResolvable, moderatorResolvable, funcData) {};

exports.changeMute = async function (guild, channel, userResolvable, moderatorResolvable, newData) {
    // Change a mute's time, reason, etc.
    Util.logc('Admin1', `\nStarted ChangeMute on ${userResolvable}`);
    const guildId = Data.getBaseGuildId(guild.id);

    // Resolve parameter data

    const resolvedUser = Util.resolveUser(guild, userResolvable);
    const resolvedModerator = Util.resolveUser(guild, moderatorResolvable, true);

    if (typeof resolvedUser === 'string') {
        return Util.commandFailed(channel, moderatorResolvable, 'ChangeMute', `${resolvedUser}`);
    }

    Util.logc('Admin1', `Resolved user as ${resolvedUser.id}`);

    // Get mute data

    const userMutes = await Data.getRecords(guild, 'mutes', { user_id: resolvedUser.id });
    const totalMutes = userMutes.length;
    const pastMutes = totalMutes - 1;

    // Check they are actually muted

    const activeMute = muteCacheActive[guildId][resolvedUser.id];

    if (!activeMute) {
        return Util.commandFailed(channel, moderatorResolvable, 'ChangeMute', 'User is not muted');
    }

    // Get change data

    const startTick = activeMute.start_tick;

    const endTickOld = activeMute.end_tick;
    const muteLengthOld = endTickOld - startTick;
    const muteReasonOld = activeMute.mute_reason;

    const muteReasonNew = newData.reason || muteReasonOld;
    let muteLengthNew = newData.time;

    const maxMuteLengthBase = getDefaultMuteTime(pastMutes);
    let maxMuteLength = maxMuteLengthBase;
    const maxMuteLengthIndex = Number((/^\[(\d+)\]/.exec(muteReasonNew) || [])[1]);

    if (!isNaN(maxMuteLengthIndex) && maxMuteLengthIndex < exports.badOffenses.length) {
        maxMuteLength = Math.max(maxMuteLength, exports.badOffenses[maxMuteLengthIndex].time);
    }

    // let changedTime = true;
    // let changedReason = true;

    if (!muteLengthNew) {
        // If no new mute time and current mute time was default then set to max
        muteLengthNew = muteLengthOld == maxMuteLengthBase ? maxMuteLength : getMinTime(muteLengthOld, maxMuteLength);
    } else {
        // Compare with max
        muteLengthNew = getMinTime(muteLengthNew, maxMuteLength);
    }

    const endTickNew = startTick + muteLengthNew;

    // Verify mute can be changed

    if (notHigherRank(moderatorResolvable, resolvedUser.member)) {
        return Util.commandFailed(channel, moderatorResolvable, 'ChangeMute', 'User has equal or higher rank');
    }

    if (
        activeMute.mod_id != resolvedModerator.id &&
        notHigherRank(moderatorResolvable, Util.getMemberById(activeMute.mod_id, guild)) &&
        activeMute.end_tick > endTickNew
    ) {
        return Util.commandFailed(
            channel,
            moderatorResolvable,
            'ChangeMute',
            "You can't lower a mute's end time unless you have higher privilege than the original moderator",
        );
    }

    // Change mute in DB

    const newDataSQL = {};

    if (newData.time && muteLengthNew != muteLengthOld) {
        newDataSQL.end_tick = endTickNew;
    } else {
        // changedTime = false;
    }

    if (newData.reason && muteReasonNew != activeMute.mute_reason) {
        newDataSQL.mute_reason = muteReasonNew;
    } else {
        // changedReason = false;
    }

    const numChanged = Object.keys(newDataSQL).length;

    if (numChanged > 0) {
        Data.updateRecords(
            guild,
            'mutes',
            {
                mute_id: activeMute.mute_id,
            },
            newDataSQL,
        );
    }

    // Change mute timeout (and automatically remove any active timeouts)

    addTimeout(guild, resolvedUser.id, endTickNew, 'mute');

    // Get changed data and format it

    const muteLengthStrOld = Util.historyToString(muteLengthOld);
    const muteLengthStrNew = Util.historyToString(muteLengthNew);

    const dateEndOld = new Date();
    dateEndOld.setTime(endTickOld);
    const dateEndNew = new Date();
    dateEndNew.setTime(endTickNew);

    const endStrOld = Util.getDateString(dateEndOld);
    const endStrNew = Util.getDateString(dateEndNew);

    const muteLengthStrChanges = { old: muteLengthStrOld, new: muteLengthStrNew };
    const endStrChanges = { old: endStrOld, new: endStrNew };
    const muteReasonChanges = { old: muteReasonOld, new: muteReasonNew };

    // Send relevant messages

    sendAlert('ChangeMute', guild, channel, resolvedUser, resolvedModerator, {
        total: totalMutes,
        lengthStr: muteLengthStrChanges,
        reason: muteReasonChanges,
        endStr: endStrChanges,
    });

    Util.logc('Admin1', 'Completed ChangeMute');

    return true;
};

exports.unMute = async function (guild, channel, userResolvable, moderatorResolvable) {
    // Stop mute
    Util.logc('Admin1', `\nStarted UnMute on ${userResolvable}`);
    const guildId = Data.getBaseGuildId(guild.id);

    // Resolve parameter data

    const resolvedUser = Util.resolveUser(guild, userResolvable);
    const resolvedModerator = Util.resolveUser(guild, moderatorResolvable, true);

    if (typeof resolvedUser === 'string') {
        return Util.commandFailed(channel, moderatorResolvable, 'UnMute', `${resolvedUser}`);
    }

    Util.logc('Admin1', `Resolved user as ${resolvedUser.id}`);

    // Get mute data

    const userMutes = await Data.getRecords(guild, 'mutes', { user_id: resolvedUser.id });
    const totalMutes = userMutes.length;

    // Check they are actually muted

    const activeMute = muteCacheActive[guildId][resolvedUser.id];

    if (!activeMute) {
        return Util.commandFailed(channel, moderatorResolvable, 'UnMute', 'User is not muted');
    }

    // Verify mute can be changed

    if (notHigherRank(moderatorResolvable, resolvedUser.member)) {
        return Util.commandFailed(channel, moderatorResolvable, 'UnMute', 'User has equal or higher rank');
    }

    if (activeMute.mod_id != resolvedModerator.id && notHigherRank(moderatorResolvable, Util.getMemberById(activeMute.mod_id, guild))) {
        return Util.commandFailed(channel, moderatorResolvable, 'UnMute', 'Moderator who muted has equal or higher privilege');
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

    delete muteCacheActive[guildId][resolvedUser.id];

    // Remove mute timeout (if stopped early)

    remTimeout(guild, resolvedUser.id, 'mute');

    // Add SendMessages role

    addSendMessages(resolvedUser.member);

    // Send the relevant messages

    sendAlert('UnMute', guild, channel, resolvedUser, resolvedModerator, { actionPast: 'Unmuted', end: true, total: totalMutes });

    Util.logc('Admin1', 'Completed UnMute');

    return true;
};

exports.remMute = async function (guild, channel, userResolvable, moderatorResolvable) {
    // Undo mute
    Util.logc('Admin1', `\nStarted RemMute on ${userResolvable}, waiting for UnMute to complete...`);

    // Stop active mute

    exports.unMute(guild, null, userResolvable, moderatorResolvable);

    Util.logc('Admin1', 'UnMute completed, continuing RemMute');

    // Resolve parameter data

    const resolvedUser = Util.resolveUser(guild, userResolvable);
    const resolvedModerator = Util.resolveUser(guild, moderatorResolvable, true);

    if (typeof resolvedUser === 'string') {
        return Util.commandFailed(channel, moderatorResolvable, 'RemMute', `${resolvedUser}`);
    }

    Util.logc('Admin1', `Resolved user as ${resolvedUser.id}`);

    const userMutes = await Data.getRecords(guild, 'mutes', { user_id: resolvedUser.id });
    const totalMutes = userMutes.length - 1;
    const hasBeenMuted = userMutes.length > 0;
    const lastMute = hasBeenMuted ? userMutes[userMutes.length - 1] : null;

    // Verify mute can be removed

    if (notHigherRank(moderatorResolvable, resolvedUser.member)) {
        return Util.commandFailed(channel, moderatorResolvable, 'RemMute', 'User has equal or higher rank');
    }

    if (
        hasBeenMuted &&
        lastMute.mod_id != resolvedModerator.id &&
        notHigherRank(moderatorResolvable, Util.getMemberById(lastMute.mod_id, guild))
    ) {
        return Util.commandFailed(channel, moderatorResolvable, 'RemMute', 'Moderator who muted has equal or higher privilege');
    }

    // Check they have actually been muted

    if (!hasBeenMuted) {
        return Util.commandFailed(channel, moderatorResolvable, 'RemMute', 'User has never been muted');
    }

    // Delete from database and cache

    Data.deleteRecords(guild, 'mutes', { mute_id: lastMute.mute_id });

    // Send the relevant messages

    sendAlert('RemMute', guild, channel, resolvedUser, resolvedModerator, { actionPast: 'Mute Reverted', end: true, total: totalMutes });

    Util.logc('Admin1', 'Completed RemMute');

    return true;
};

exports.clearMutes = async function (guild, channel, userResolvable, moderatorResolvable) {
    // Undo mute
    Util.logc('Admin1', `\nStarted ClearMutes on ${userResolvable}, waiting for UnMute to complete...`);

    // Stop active mute

    exports.unMute(guild, null, userResolvable, moderatorResolvable);

    Util.logc('Admin1', 'UnMute completed, continuing ClearMutes');

    // Resolve parameter data

    const resolvedUser = Util.resolveUser(guild, userResolvable);
    const resolvedModerator = Util.resolveUser(guild, moderatorResolvable, true);

    if (typeof resolvedUser === 'string') {
        return Util.commandFailed(channel, moderatorResolvable, 'ClearMutes', `${resolvedUser}`);
    }

    Util.logc('Admin1', `Resolved user as ${resolvedUser.id}`);

    const userMutes = await Data.getRecords(guild, 'mutes', { user_id: resolvedUser.id });
    const totalMutes = 0;
    const hasBeenMuted = userMutes.length > 0;

    // Verify mutes can be removed

    if (notHigherRank(moderatorResolvable, resolvedUser.member)) {
        return Util.commandFailed(channel, moderatorResolvable, 'ClearMutes', 'User has equal or higher rank');
    }

    // Check they have actually been muted

    if (!hasBeenMuted) {
        return Util.commandFailed(channel, moderatorResolvable, 'ClearMutes', 'User has never been muted');
    }

    // Delete from database and cache

    Data.deleteRecords(guild, 'mutes', { user_id: resolvedUser.id });

    // Send the relevant messages

    sendAlert('ClearMutes', guild, channel, resolvedUser, resolvedModerator, { actionPast: 'Mute Cleared', end: true, total: totalMutes });

    Util.logc('Admin1', 'Completed ClearMutes');

    return true;
};

exports.addBan = async function (guild, channel, userResolvable, moderatorResolvable, banData) {
    // Add ban
    Util.logc('Admin1', `\nStarted AddBan on ${userResolvable}`);

    // Resolve parameter data

    if (!banData) banData = {};

    let banLength = banData.time;
    const banReason = banData.reason || 'No reason provided'; // TODO: Add ' | The user's final message was: msg'
    const banTemp = banData.temp;

    const resolvedUser = Util.resolveUser(guild, userResolvable);
    const resolvedModerator = Util.resolveUser(guild, moderatorResolvable, true);

    if (typeof resolvedUser === 'string') {
        return Util.commandFailed(channel, moderatorResolvable, 'AddBan', `${resolvedUser}`);
    }

    Util.logc('Admin1', `Resolved user as ${resolvedUser.id}`);

    // Get past ban data

    const userMutes = await Data.getRecords(guild, 'mutes', { user_id: resolvedUser.id });
    const userBans = await Data.getRecords(guild, 'bans', { user_id: resolvedUser.id });
    const activeBan = userBans.find(banRecord => banRecord.active == 1);
    const pastMutes = userMutes.length;
    const totalBans = userBans.length + 1;
    const totalOffenses = pastMutes + totalBans;

    // Verify they can be banned

    if (notHigherRank(moderatorResolvable, resolvedUser.member)) {
        return Util.commandFailed(channel, moderatorResolvable, 'AddBan', 'User has equal or higher rank');
    }

    // Stop here if the ban isn't temporary

    if (!banTemp) {
        banMember(guild, channel, resolvedUser, resolvedModerator, banReason, { temp: banTemp, totalBans, banLengthStr: 'Forever' });
        return true;
    }

    // Get ban time data

    const startTick = +new Date();

    if (banTemp) {
        const maxBanLength = exports.dayMilli * 2 * totalOffenses;
        banLength = banLength ? getMinTime(banLength, maxBanLength) : maxBanLength;
    } else {
        banLength = 3155692608000; // 100 years
    }

    const endTick = startTick + banLength;

    const dateEnd = new Date();
    dateEnd.setTime(+dateEnd + banLength);

    const banLengthStr = Util.historyToString(banLength);

    // Verify they can be banned

    if (
        activeBan &&
        activeBan.mod_id != resolvedModerator.id &&
        notHigherRank(moderatorResolvable, Util.getMemberById(activeBan.mod_id, guild)) &&
        activeBan.end_tick > endTick
    ) {
        return Util.commandFailed(
            channel,
            moderatorResolvable,
            'AddBan',
            "The user is already banned: You can't override a user's ban with an earlier end time unless you have higher privilege than the original moderator",
        );
    }

    // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Add their ban to the database and cache

    const newRow = {
        user_id: resolvedUser.id, // VARCHAR(24)
        mod_id: resolvedModerator.id, // VARCHAR(24)
        ban_reason: banReason, // TEXT
        start_tick: startTick, // BIGINT
        end_tick: endTick, // BIGINT
        active: 1, // BIT
    };

    Data.updateRecords(
        guild,
        'bans',
        {
            user_id: resolvedUser.id,
        },
        {
            active: 0,
        },
    );

    Data.addRecord(guild, 'bans', newRow);

    // Add ban timeout (and automatically remove any active timeouts)

    addTimeout(guild, resolvedUser.id, endTick, 'ban');

    // Ban member

    banMember(guild, channel, resolvedUser, resolvedModerator, banReason, { temp: banTemp, dateEnd, totalBans, banLengthStr });

    Util.logc('Admin1', 'Completed AddBan');

    return true;
};

exports.unBan = async function (guild, channel, userResolvable, moderatorResolvable) {
    // Stop temp ban
    Util.logc('Admin1', `\nStarted UnBan on ${userResolvable}`);

    // Resolve parameter data

    const resolvedUser = Util.resolveUser(guild, userResolvable);
    const resolvedModerator = Util.resolveUser(guild, moderatorResolvable, true);

    if (typeof resolvedUser === 'string') {
        return Util.commandFailed(channel, moderatorResolvable, 'UnBan', `${resolvedUser}`);
    }

    Util.logc('Admin1', `Resolved user as ${resolvedUser.id}`);

    // Get ban data

    const userBans = await Data.getRecords(guild, 'bans', { user_id: resolvedUser.id });
    const totalBans = userBans.length;

    // Check they are actually banned

    const activeBan = userBans.find(banRecord => banRecord.active == 1);

    /* if (!activeBan) { // Could have been banned manually
        return Util.commandFailed(channel, moderatorResolvable, 'UnBan', 'User is not banned');
    } */

    // Verify ban can be changed

    if (notHigherRank(moderatorResolvable, resolvedUser.member)) {
        return Util.commandFailed(channel, moderatorResolvable, 'UnBan', 'User has equal or higher rank');
    }

    if (
        activeBan &&
        activeBan.mod_id != resolvedModerator.id &&
        notHigherRank(moderatorResolvable, Util.getMemberById(activeBan.mod_id, guild))
    ) {
        return Util.commandFailed(channel, moderatorResolvable, 'UnBan', 'Moderator who banned has equal or higher privilege');
    }

    // Update ban SQL record and cache

    Data.updateRecords(
        guild,
        'bans',
        {
            user_id: resolvedUser.id,
        },
        {
            active: 0,
        },
    );

    // Remove ban timeout (if stopped early)

    remTimeout(guild, resolvedUser.id, 'ban');

    // Remove ban from the server

    unBanMember(guild, channel, resolvedUser, resolvedModerator, { totalBans, temp: activeBan != null });

    Util.logc('Admin1', 'Completed UnBan');

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

    await Promise.all(
        client.guilds.map(async (guild) => {
            const guildId = Data.getBaseGuildId(guild.id);
            if (guildId != guild.id) return;

            muteCacheActive[guildId] = {};
            const allMutes = await Data.getRecords(guild, 'mutes');
            const allBans = await Data.getRecords(guild, 'bans');

            for (let i = 0; i < allMutes.length; i++) {
                const record = allMutes[i];

                if (record.active == 1) {
                    muteCacheActive[guildId][record.user_id] = record;
                    addTimeout(guild, record.user_id, record.end_tick, 'mute');
                }
            }

            for (let i = 0; i < allBans.length; i++) {
                const record = allBans[i];

                if (record.active == 1) {
                    addTimeout(guild, record.user_id, record.end_tick, 'ban');
                }
            }
        }),
    );

    Util.logc('MutesInit', '> Completed mute initialization');

    index.secure();
};
