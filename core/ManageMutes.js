const DateFormat = index.DateFormat;

const muteEvents = [];

exports.defaultMuteLength = 1800000;

/*

    -Storing a mute (active)
        Guild:
            {
                userId: User id
                modId: Moderator id
                endTick: Mute end tick
                muteReason: Mute reason
            }

    -Storing a mute (history)
    Muting someone
        -Checks history in current guild (because all linked should be the same)
        -Sets history in all linked guilds
        -Sets mute in all linked guilds

*/

function checkMutedInner(targetId, guild) {
    return (!!Data.guildGet(guild, Data.muted, targetId));
}

function checkAllowed(targetMember, authPosition, channel, speaker, targetId, speakerValid, speakerId, speakerName) {
    if (authPosition <= Util.getPosition(targetMember)) {
        if (channel != null) {
            Util.log(`${speakerName}_User has equal or higher rank`);
            Util.commandFailed(channel, speaker, 'User has equal or higher rank');
        }
        return false;
    }

    if (speakerValid && (targetId === vaebId && speakerId !== vaebId)) {
        if (channel != null) {
            Util.commandFailed(channel, speaker, "You cannot mute VaeBot's developer");
        }
        return false;
    }

    return undefined;
}

function updateMuteLength(guild, targetId, muteName, timeScale) {
    let muteLength;

    const oldHistory = Data.guildGet(guild, Data.history, targetId);

    if (oldHistory && (timeScale >= 1 || oldHistory[0] !== exports.defaultMuteLength)) {
        muteLength = oldHistory[0] * timeScale;

        if (muteLength < 0) muteLength = oldHistory[0];

        Data.guildRun(guild, Data.history, targetId, ((result) => {
            result[0] = muteLength;
        }));
    } else {
        muteLength = exports.defaultMuteLength; // 1800000

        Data.guildSet(guild, Data.history, targetId, [muteLength, muteName]);
    }

    return muteLength;
}

function sendMuteLog(guild, targetMember, speakerName, reason, endStr, timeRemaining) {
    const sendLogData = [
        'User Muted',
        guild,
        targetMember,
        { name: 'Username', value: targetMember.toString() },
        { name: 'Moderator', value: speakerName },
        { name: 'Mute Reason', value: reason },
        { name: 'Mute Expires', value: endStr },
        { name: 'Mute History', value: timeRemaining },
    ];
    Util.sendLog(sendLogData, colAction);
}

function sendMuteDM(guild, reason, endStr, timeRemaining, targetMember) {
    const outStr = ['**You have been muted**\n```'];
    outStr.push(`Guild: ${guild.name}`);
    outStr.push(`Reason: ${reason}`);
    outStr.push(`Mute expires: ${endStr}`);
    outStr.push(`Time remaining: ${timeRemaining}`);
    outStr.push('```');
    Util.print(targetMember, outStr.join('\n'));
}

function sendMuteChannel(channel, noOut, targetMember, reason, endStr, timeRemaining, speaker) {
    if (channel && !noOut) {
        const sendEmbedFields = [
            { name: 'Username', value: Util.getMention(targetMember) },
            { name: 'Mute Reason', value: reason },
            { name: 'Mute Expires', value: endStr },
            { name: 'Time Remaining', value: timeRemaining },
        ];
        Util.sendEmbed(channel, 'User Muted', null, Util.makeEmbedFooter(speaker), Util.getAvatar(targetMember), 0x00E676, sendEmbedFields);
    }
}

function removeSend(member) {
    const guild = member.guild;
    const linkedGuilds = Data.getLinkedGuilds(guild);
    const memberId = member.id;

    for (let i = 0; i < linkedGuilds.length; i++) {
        const linkedGuild = linkedGuilds[i];
        const linkedMember = Util.getMemberById(memberId, linkedGuild);

        if (linkedMember) {
            const role = Util.getRole('SendMessages', linkedMember);
            if (role != null) {
                linkedMember.removeRole(role)
                .then(() => {
                    Util.log(`Link-removed SendMessages from ${Util.getName(linkedMember)} @ ${linkedGuild.name}`);
                })
                .catch(error => Util.log(`[E_LinkRoleRem1] ${error}`));
            }
        }
    }
}

function addSend(member) {
    const guild = member.guild;
    const linkedGuilds = Data.getLinkedGuilds(guild);
    const memberId = member.id;

    for (let i = 0; i < linkedGuilds.length; i++) {
        const linkedGuild = linkedGuilds[i];
        const linkedMember = Util.getMemberById(memberId, linkedGuild);

        if (linkedMember) {
            const role = Util.getRole('SendMessages', linkedGuild);
            if (role != null) {
                linkedMember.addRole(role)
                .then(() => {
                    Util.log(`Link-added SendMessages to ${Util.getName(linkedMember)} @ ${linkedGuild.name}`);
                })
                .catch(error => Util.log(`[E_LinkRoleAdd1] ${error}`));
            }
        }
    }
}

function stopUnMuteTimeout(targetId, guild) {
    const baseGuild = Data.getBaseGuild(guild);
    for (let i = muteEvents.length - 1; i >= 0; i--) {
        const oldTimeout = muteEvents[i];
        if (oldTimeout[0] === targetId && oldTimeout[1] === baseGuild.id) {
            clearTimeout(oldTimeout[2]);
            Util.log(`Removed timeout ${targetId}`);
            muteEvents.splice(i, 1);
        }
    }
}

function addUnMuteEvent(targetId, guild, timeParam, name) {
    const baseGuild = Data.getBaseGuild(guild);

    const time = Math.max(timeParam, 0);

    stopUnMuteTimeout(targetId, guild);

    const timeoutFunc = function () {
        Util.log(`Unmute timeout for ${name} (${targetId}) has finished @ ${guild.name}`);
        exports.unMuteName(targetId, true, guild, Infinity, null, 'System');
    };

    guild.fetchMember(targetId)
    .then(() => {
        Util.log(`Started unmute timeout for ${name} (${targetId}) ${guild.name} - ${time}`);
        muteEvents.push([targetId, baseGuild.id, setTimeout(timeoutFunc, Math.min(time, 2147483646))]);
    })
    .catch(() => {
        Util.log(`Started unmute timeout [User has left] for ${name} (${targetId}) ${guild.name} - ${time}`);
        muteEvents.push([targetId, baseGuild.id, setTimeout(timeoutFunc, Math.min(time, 2147483646))]);
    });
}

exports.checkMuted = function (targetId, guild) {
    if (guild == null) {
        Util.log('[CheckMuted] No guild argument');
        return false;
    }

    let isMuted = checkMutedInner(targetId, guild);

    if (!isMuted) {
        const guildId = guild.id;
        const linkedGuilds = Data.getLinkedGuilds(guild);

        for (let i = 0; i < linkedGuilds.length; i++) {
            const linkedGuild = linkedGuilds[i];
            const linkedGuildId = linkedGuild.id;

            if (linkedGuildId !== guildId) {
                isMuted = checkMutedInner(targetId, linkedGuild);
                if (isMuted) break;
            }
        }
    }

    return isMuted;
};

exports.doWarn = function (targetMember, reason, guild, authPosition, channel, speaker, noOut) {
    // Set some variable data

    const targetId = targetMember.id;
    const muteName = Util.getName(targetMember);
    const isMuted = exports.checkMuted(targetId, guild);

    // Get speaker information (if one exists)

    const speakerValid = Util.isObject(speaker);
    let speakerName = speaker;
    let speakerId = null;

    if (speakerValid) {
        speakerName = speaker.toString();
        speakerId = speaker.id;
    }

    // Check if user is allowed to be muted

    if (isMuted) {
        if (channel != null) {
            Util.log(`${speakerName}_User is already muted`);
            Util.commandFailed(channel, speaker, 'User is already muted');
        }
        return false;
    }

    const returnVal1 = checkAllowed(targetMember, authPosition, channel, speaker, targetId, speakerValid, speakerId, speakerName);
    if (returnVal1 != null) return returnVal1;

    // Save mute information to linked file

    const muteLength = exports.defaultMuteLength;

    const endTime = Date.now() + muteLength;

    const dateEnd = new Date();
    dateEnd.setTime(endTime);

    const endStr = `${DateFormat(dateEnd, '[dd/mm/yyyy] HH:MM:ss')} GMT`;

    Data.guildSet(guild, Data.muted, targetId, [guild.id, endTime, muteName, reason, speakerId]);

    // Finalise mute

    addUnMuteEvent(targetId, guild, muteLength, muteName);

    Events.emit(guild, 'UserMute', targetMember, reason, muteLength, speakerId);

    removeSend(targetMember);

    // Save the mute for briefing

    const timeRemaining = Util.historyToString(muteLength);
    if (guild.id === '168742643021512705') {
        index.dailyMutes.push([targetId, `${muteName}#${targetMember.discriminator}`, reason, timeRemaining]);
    }

    // Output mute information in channel

    sendMuteChannel(channel, noOut, targetMember, reason, endStr, timeRemaining, speaker);

    /*
    Util.sendEmbed(
        Channel Object,
        Title String,
        Description String,
        Username + ID String,
        Avatar URL String,
        Color Number,
        Fields Array
    );
    */

    // Output mute information in log

    sendMuteLog(guild, targetMember, speakerName, reason, endStr, timeRemaining);

    // DM muted user with mute information

    sendMuteDM(guild, reason, endStr, timeRemaining, targetMember);

    return timeRemaining; // Formatted string
};

exports.doMute = function (targetMember, reason, guild, authPosition, channel, speaker, noOut, timeScaleParam) {
    // Set some variable data

    const targetId = targetMember.id;
    const muteName = Util.getName(targetMember);
    const mostName = Util.getMostName(targetMember);

    const timeScale = timeScaleParam == null ? 2 : timeScaleParam;

    // Get speaker information (if one exists)

    const speakerValid = Util.isObject(speaker);
    let speakerName = speaker;
    let speakerFullName = speaker;
    let speakerId = null;

    if (speakerValid) {
        speakerName = speaker.toString();
        speakerFullName = Util.getFullName(speaker);
        speakerId = speaker.id;
    }

    // Check if user is allowed to be muted

    const returnVal1 = checkAllowed(targetMember, authPosition, channel, speaker, targetId, speakerValid, speakerId, speakerName);
    if (returnVal1 != null) return returnVal1;

    // Save mute information to linked file

    const muteLength = updateMuteLength(guild, targetId, muteName, timeScale);
    const muteNum = Math.log2(muteLength / (1000 * 60 * 60)) + 2;

    const endTime = Date.now() + muteLength;

    const dateStart = new Date();

    const dateEnd = new Date();
    dateEnd.setTime(endTime);

    const startStr = `${DateFormat(dateStart, '[dd/mm/yyyy] HH:MM:ss')} GMT`;
    const endStr = `${DateFormat(dateEnd, '[dd/mm/yyyy] HH:MM:ss')} GMT`;

    Data.guildSet(guild, Data.muted, targetId, [guild.id, endTime, muteName, reason, speakerId]);

    // Finalise mute

    addUnMuteEvent(targetId, guild, muteLength, muteName);

    Events.emit(guild, 'UserMute', targetMember, reason, muteLength, speakerId);

    removeSend(targetMember);

    // Save the mute for briefing

    const timeRemaining = Util.historyToString(muteLength);
    if (guild.id === '168742643021512705') {
        index.dailyMutes.push([targetId, `${muteName}#${targetMember.discriminator}`, reason, timeRemaining]);
    }

    // Output mute information in channel

    sendMuteChannel(channel, noOut, targetMember, reason, endStr, timeRemaining, speaker);

    // Output mute information in log

    sendMuteLog(guild, targetMember, speakerName, reason, endStr, timeRemaining);

    // DM muted user with mute information

    sendMuteDM(guild, reason, endStr, timeRemaining, targetMember);

    // Upload mute information to trello

    const cardDesc = {
        'User ID': targetId,
        'Moderator': speakerFullName,
        'Reason': reason,
        'Length': `${timeRemaining} (${Util.getSuffix(muteNum)} offense)`,
        'Start': startStr,
        'End': endStr,
    };

    if (!noOut) {
        Trello.findCard(guild, 'Mutes', targetId, (ok, cardData) => {
            if (ok) {
                const cardId = cardData.id;
                Trello.dueComplete(guild, cardId, () => {
                    Trello.addCard(guild, 'Mutes', mostName, cardDesc, dateEnd);
                });
            } else {
                Trello.addCard(guild, 'Mutes', mostName, cardDesc, dateEnd);
            }
        });
    } else {
        Trello.findCard(guild, 'Mutes', targetId, (ok, cardData) => {
            if (ok) {
                const cardId = cardData.id;
                Trello.setDesc(guild, cardId, cardDesc);
                Trello.setDue(guild, cardId, dateEnd);
            }
        });
    }

    return timeRemaining; // Formatted string
};

exports.unMute = function (targetMember, guild, authPosition, channel, speaker) {
    // Set some variable data

    const targetId = targetMember.id;
    const muteName = Util.getName(targetMember);

    // Get speaker data (if one exists)

    const speakerValid = Util.isObject(speaker);
    let speakerName = speaker;
    let speakerId = null;

    // Get original mute data

    const mutedData = Data.guildGet(guild, Data.muted, targetId);

    const origModId = mutedData[4];
    const origMod = Util.getMemberById(origModId, guild);
    const origModPos = origMod != null ? Util.getPosition(origMod) : -1;

    const muteHistory = Util.getHistory(targetId, guild);
    const muteHistoryString = Util.historyToString(muteHistory);

    if (speakerValid) {
        speakerName = speaker.toString();
        speakerId = speaker.id;
    }

    // Check if user is allowed to be unmuted

    if (speakerId !== vaebId && authPosition <= Util.getPosition(targetMember)) {
        if (channel != null) {
            Util.log(`${speakerName}_User has equal or higher rank`);
            Util.commandFailed(channel, speaker, 'User has equal or higher rank');
        }
        return false;
    }

    if (speakerValid && speakerId !== vaebId && speakerId !== selfId && (origModId === vaebId || authPosition < origModPos)) {
        if (channel != null) {
            Util.log(`${speakerName}_Moderator who muted has higher privilege`);
            Util.commandFailed(channel, speaker, 'Moderator who muted has higher privilege');
        }
        return false;
    }

    // Remove mute information from linked file

    Data.guildDelete(guild, Data.muted, targetId);

    // Finalise unmute

    stopUnMuteTimeout(targetId, guild);

    Events.emit(guild, 'UserUnMute', targetMember, muteHistory, speakerId);

    addSend(targetMember);

     // Output mute information in channel

    if (authPosition === Infinity) {
        Util.log(`Unmuted ${muteName}`);
    } else if (channel != null) {
        const sendEmbedFields = [
            { name: 'Username', value: Util.getMention(targetMember) },
            { name: 'Mute History', value: muteHistoryString },
        ];

        Util.sendEmbed(channel, 'User Unmuted', null, Util.makeEmbedFooter(speaker), Util.getAvatar(targetMember), 0x00E676, sendEmbedFields);
    }

     // Output unmute information in log

    const sendLogData = [
        'User Unmuted',
        guild,
        targetMember,
        { name: 'Username', value: targetMember.toString() },
        { name: 'Moderator', value: speakerName },
        { name: 'Mute History', value: muteHistoryString },
    ];
    Util.sendLog(sendLogData, colAction);

    // DM muted user with unmute information

    const outStr = ['**You have been unmuted**\n```'];
    outStr.push(`Guild: ${guild.name}`);
    outStr.push('```');
    Util.print(targetMember, outStr.join('\n'));

    Trello.findCard(guild, 'Mutes', targetId, (ok, cardData) => {
        if (ok) {
            const cardId = cardData.id;
            Trello.dueComplete(guild, cardId);
        }
    });

    return true; // Success
};

exports.undoMute = function (targetMember, guild, authPosition, channel, speaker) {
    const targetId = targetMember.id;
    const didWork = exports.unMuteName(targetId, false, guild, Util.getPosition(speaker), null, speaker);

    if (didWork) {
        let newMuteTime = 0;
        const oldHistory = Data.guildGet(guild, Data.history, targetId);
        if (oldHistory) {
            const muteTime = oldHistory[0];
            if (muteTime > Mutes.defaultMuteLength) {
                newMuteTime = muteTime * 0.5;
                oldHistory[0] = newMuteTime;
                Data.guildSaveData(Data.history);
            } else {
                Data.guildDelete(guild, Data.history, targetId);
            }
        }

        const sendEmbedFields = [
            { name: 'Username', value: Util.getMention(targetMember) },
            { name: 'Mute History', value: Util.historyToString(newMuteTime) },
        ];
        Util.sendEmbed(channel, 'Reverted Mute', null, Util.makeEmbedFooter(speaker), Util.getAvatar(targetMember), 0x00E676, sendEmbedFields);

        const sendLogData = [
            'Reverted Mute',
            guild,
            targetMember,
            { name: 'Username', value: targetMember.toString() },
            { name: 'Moderator', value: speaker.toString() },
            { name: 'Mute History', value: Util.historyToString(newMuteTime) },
        ];
        Util.sendLog(sendLogData, colAction);

        Trello.findCard(guild, 'Mutes', targetId, (ok, cardData) => {
            if (ok) {
                const cardId = cardData.id;
                Trello.addLabel(guild, cardId, 'Reverted');
            }
        });
    }
};

exports.doMuteName = function (name, guild, authPosition, channel, speaker, isWarn) {
    const data = Util.getDataFromString(name, [
        function (str) {
            return Util.getMemberByMixed(str, guild);
        },
    ], true);

    if (!data) {
        if (channel) {
            Util.sendEmbed(channel, 'Mute Failed', 'User not found', Util.makeEmbedFooter(speaker), null, 0x00E676, null);
        } else {
            Util.log('Mute failed: Unable to find user');
        }
        return;
    }

    const targetMember = data[0];
    const reason = data[1];

    if (!isWarn) {
        exports.doMute(targetMember, reason, guild, authPosition, channel, speaker);
    } else {
        exports.doWarn(targetMember, reason, guild, authPosition, channel, speaker);
    }
};

exports.unMuteName = function (nameParam, isDefinite, guild, authPosition, channel, speaker) {
    const safeId = Util.getSafeId(nameParam);
    const name = nameParam.toLowerCase();

    const speakerName = Util.isObject(speaker) ? speaker.toString() : speaker;

    const mutedGuild = Data.guildGet(guild, Data.muted);

    let backupTarget;

    Util.log(`Unmute Name: ${name}`);

    for (const [targetId] of Object.entries(mutedGuild)) {
        const targetMember = Util.getMemberById(targetId, guild);
        if (targetMember) {
            const targetName = Util.getName(targetMember);
            const targetNick = targetMember.nickname;
            // Util.log(targetName);
            if ((safeId && safeId === targetId) || (targetNick != null && (targetNick.toLowerCase().includes(name)))) {
                return exports.unMute(targetMember, guild, authPosition, channel, speaker);
            } else if (targetName.toLowerCase().includes(name)) {
                backupTarget = targetMember;
            }
        }
    }

    // Util.log(name);
    // Util.log(backupTarget);

    if (isDefinite) {
        Util.log(`Muted user has left so unmute method changed: ${name}`);

        Data.guildDelete(guild, Data.muted, safeId);

        const muteHistoryString = Util.historyToString(Util.getHistory(safeId, guild));

        const sendLogData = [
            'User Unmuted (User Left)',
            guild,
            null,
            { name: 'Username', value: `<@${name}>` },
            { name: 'Moderator', value: speakerName },
            { name: 'Mute History', value: muteHistoryString },
        ];

        Util.sendLog(sendLogData, colAction);

        stopUnMuteTimeout(safeId, guild);

        return true;
    } else if (backupTarget != null) {
        return exports.unMute(backupTarget, guild, authPosition, channel, speaker);
    } else if (channel != null) {
        Util.log(`(Channel included) Unmute failed: Unable to find muted user (${name}) from ${speakerName}`);
        Util.sendEmbed(channel, 'Unmute Failed', 'User not found', Util.makeEmbedFooter(speaker), null, 0x00E676, null);
    } else {
        Util.log(`(Channel not included) Unmute failed: Unable to find muted user (${name}) from ${speakerName}`);
    }

    return true;
};

exports.restartTimeouts = function () {
    const preDate = Date.now();
    const guilds = client.guilds;
    const hasChecked = {};
    for (const [guildId] of Object.entries(Data.muted)) {
        const baseGuild = Data.getBaseGuild(guilds.get(guildId));
        if (baseGuild == null) Util.log(`Null baseGuild ${guildId} ${guilds.get(guildId) == null}`);
        const baseId = baseGuild.id;
        if (!hasChecked[baseId]) {
            hasChecked[baseId] = true;
            const mutedGuild = Data.muted[guildId];
            for (const [targetId] of Object.entries(mutedGuild)) {
                const nowMuted = mutedGuild[targetId];
                addUnMuteEvent(targetId, guilds.get(nowMuted[0]), nowMuted[1] - preDate, nowMuted[2]);
            }
        }
    }
};
