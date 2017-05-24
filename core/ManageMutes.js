exports.muteEvents = [];

exports.defaultMuteTime = 1800000;

/*

    [ Saving a mute saves it to all linked guild ]
    Muting someone
        -Checks history in current guild (because all linked should be the same)
        -Sets history in all linked guilds
        -Sets mute in all linked guilds

*/

function checkMutedInner(id, guild) {
    return (!!Data.guildGet(guild, Data.muted, id));
}

exports.removeSend = function (member) {
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
                    console.log(`Link-removed SendMessages from ${Util.getName(linkedMember)} @ ${linkedGuild.name}`);
                })
                .catch(error => console.log(`\n[E_LinkRoleRem1] ${error}`));
            }
        }
    }
};

exports.addSend = function (member) {
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
                    console.log(`Link-added SendMessages to ${Util.getName(linkedMember)} @ ${linkedGuild.name}`);
                })
                .catch(error => console.log(`\n[E_LinkRoleAdd1] ${error}`));
            }
        }
    }
};

exports.checkMuted = function (id, guild) {
    let isMuted = checkMutedInner(id, guild);

    if (!isMuted) {
        const guildId = guild.id;
        const linkedGuilds = Data.getLinkedGuilds(guild);

        for (let i = 0; i < linkedGuilds.length; i++) {
            const linkedGuild = linkedGuilds[i];
            const linkedGuildId = linkedGuild.id;

            if (linkedGuildId !== guildId) {
                isMuted = checkMutedInner(id, linkedGuild);
                if (isMuted) break;
            }
        }
    }

    return isMuted;
};

exports.doWarn = function (targetMember, reason, guild, pos, channel, speaker, noOut) {
    // Set some variable data

    const id = targetMember.id;
    const muteName = Util.getName(targetMember);
    const isMuted = exports.checkMuted(id, guild);

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
            console.log(`${speakerName}_User is already muted`);
            Util.commandFailed(channel, speaker, 'User is already muted');
        }
        return false;
    }

    if (pos <= Util.getPosition(targetMember)) {
        if (channel != null) {
            console.log(`${speakerName}_User has equal or higher rank`);
            Util.commandFailed(channel, speaker, 'User has equal or higher rank');
        }
        return false;
    }

    if (speakerValid && (id === vaebId && speakerId !== vaebId)) {
        if (channel != null) {
            Util.commandFailed(channel, speaker, "You cannot mute VaeBot's developer");
        }
        return false;
    }

    // Save mute information to linked file

    const nowDate = Date.now();
    const muteTime = exports.defaultMuteTime;

    const endTime = nowDate + muteTime;

    Data.guildSet(guild, Data.muted, id, [guild.id, endTime, muteName, reason, speakerId]);

    // Finalise mute

    exports.addUnMuteEvent(id, guild, muteTime, muteName);

    Events.emit(guild, 'UserMute', targetMember, reason, muteTime, speakerId);

    exports.removeSend(targetMember);

    // Save the mute for briefing

    const timeRemaining = Util.historyToString(muteTime);
    if (guild.id === '168742643021512705') {
        index.dailyMutes.push([id, `${muteName}#${targetMember.discriminator}`, reason, timeRemaining]);
    }

    // Output mute information in channel

    const d = new Date();
    d.setTime(endTime);
    const endStr = `[${Util.getDayStr(d)}/${Util.getMonthStr(d)}/${Util.getYearStr(d)}] ${Util.getHourStr(d)}:${Util.getMinStr(d)} GMT`;

    if (channel && !noOut) {
        const sendEmbedFields = [
            { name: 'Username', value: Util.getMention(targetMember) },
            { name: 'Mute Reason', value: reason },
            { name: 'Mute Expires', value: endStr },
            { name: 'Time Remaining', value: timeRemaining },
        ];
        Util.sendEmbed(channel, 'User Muted', null, Util.makeEmbedFooter(speaker), Util.getAvatar(targetMember), 0x00E676, sendEmbedFields);
    }

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

    // DM muted user with mute information

    const outStr = ['**You have been muted**\n```'];
    outStr.push(`Guild: ${guild.name}`);
    outStr.push(`Reason: ${reason}`);
    outStr.push(`Mute expires: ${endStr}`);
    outStr.push(`Time remaining: ${timeRemaining}`);
    outStr.push('```');
    Util.print(targetMember, outStr.join('\n'));

    return timeRemaining; // Formatted string
};

exports.doMute = function (targetMember, reason, guild, pos, channel, speaker, noOut, timeScaleParam) {
    // Set some variable data

    const id = targetMember.id;
    const muteName = Util.getName(targetMember);

    const timeScale = timeScaleParam == null ? 2 : timeScaleParam;

    // Get speaker information (if one exists)

    const speakerValid = Util.isObject(speaker);
    let speakerName = speaker;
    let speakerId = null;

    if (speakerValid) {
        speakerName = speaker.toString();
        speakerId = speaker.id;
    }

    // Check if user is allowed to be muted

    if (pos <= Util.getPosition(targetMember)) {
        if (channel != null) {
            console.log(`${speakerName}_User has equal or higher rank`);
            Util.commandFailed(channel, speaker, 'User has equal or higher rank');
        }
        return false;
    }

    if (speakerValid && (id === vaebId && speakerId !== vaebId)) {
        if (channel != null) {
            Util.commandFailed(channel, speaker, "You cannot mute VaeBot's developer");
        }
        return false;
    }

    // Save mute information to linked file

    const nowDate = Date.now();
    let muteTime;

    const oldHistory = Data.guildGet(guild, Data.history, id);

    if (oldHistory && (timeScale >= 1 || oldHistory[0] !== exports.defaultMuteTime)) {
        muteTime = oldHistory[0] * timeScale;

        if (muteTime < 0) muteTime = oldHistory[0];

        Data.guildRun(guild, Data.history, id, ((result) => {
            result[0] = muteTime;
        }));
    } else {
        muteTime = exports.defaultMuteTime; // 1800000

        Data.guildSet(guild, Data.history, id, [muteTime, muteName]);
    }

    const endTime = nowDate + muteTime;

    Data.guildSet(guild, Data.muted, id, [guild.id, endTime, muteName, reason, speakerId]);

    // Finalise mute

    exports.addUnMuteEvent(id, guild, muteTime, muteName);

    Events.emit(guild, 'UserMute', targetMember, reason, muteTime, speakerId);

    exports.removeSend(targetMember);

    // Save the mute for briefing

    const timeRemaining = Util.historyToString(muteTime);
    if (guild.id === '168742643021512705') {
        index.dailyMutes.push([id, `${muteName}#${targetMember.discriminator}`, reason, timeRemaining]);
    }

    // Output mute information in channel

    const d = new Date();
    d.setTime(endTime);
    const endStr = `[${Util.getDayStr(d)}/${Util.getMonthStr(d)}/${Util.getYearStr(d)}] ${Util.getHourStr(d)}:${Util.getMinStr(d)} GMT`;

    if (channel && !noOut) {
        const sendEmbedFields = [
            { name: 'Username', value: Util.getMention(targetMember) },
            { name: 'Mute Reason', value: reason },
            { name: 'Mute Expires', value: endStr },
            { name: 'Time Remaining', value: timeRemaining },
        ];
        Util.sendEmbed(channel, 'User Muted', null, Util.makeEmbedFooter(speaker), Util.getAvatar(targetMember), 0x00E676, sendEmbedFields);
    }

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

    // DM muted user with mute information

    const outStr = ['**You have been muted**\n```'];
    outStr.push(`Guild: ${guild.name}`);
    outStr.push(`Reason: ${reason}`);
    outStr.push(`Mute expires: ${endStr}`);
    outStr.push(`Time remaining: ${timeRemaining}`);
    outStr.push('```');
    Util.print(targetMember, outStr.join('\n'));

    return timeRemaining; // Formatted string
};

exports.unMute = function (targetMember, guild, pos, channel, speaker) {
    // Set some variable data

    const id = targetMember.id;
    const muteName = Util.getName(targetMember);

    // Get speaker data (if one exists)

    const speakerValid = Util.isObject(speaker);
    let speakerName = speaker;
    let speakerId = null;

    // Get original mute data

    const mutedData = Data.guildGet(guild, Data.muted, id);

    const origModId = mutedData[4];
    const origMod = Util.getMemberById(origModId, guild);
    const origModPos = origMod != null ? Util.getPosition(origMod) : -1;

    const muteHistory = Util.getHistory(id, guild);
    const muteHistoryString = Util.historyToString(muteHistory);

    if (speakerValid) {
        speakerName = speaker.toString();
        speakerId = speaker.id;
    }

    // Check if user is allowed to be unmuted

    if (speakerId !== vaebId && pos <= Util.getPosition(targetMember)) {
        if (channel != null) {
            console.log(`${speakerName}_User has equal or higher rank`);
            Util.commandFailed(channel, speaker, 'User has equal or higher rank');
        }
        return false;
    }

    if (speakerValid && speakerId !== vaebId && speakerId !== selfId && (origModId === vaebId || pos < origModPos)) {
        if (channel != null) {
            console.log(`${speakerName}_Moderator who muted has higher privilege`);
            Util.commandFailed(channel, speaker, 'Moderator who muted has higher privilege');
        }
        return false;
    }

    // Remove mute information from linked file

    Data.guildDelete(guild, Data.muted, id);

    // Finalise unmute

    exports.stopUnMuteTimeout(id, guild);

    Events.emit(guild, 'UserUnMute', targetMember, muteHistory, speakerId);

    exports.addSend(targetMember);

     // Output mute information in channel

    if (pos === Infinity) {
        console.log(`Unmuted ${muteName}`);
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

    return true; // Success
};

exports.doMuteName = function (name, guild, pos, channel, speaker, isWarn) {
    const data = Util.getDataFromString(name, [
        function (str) {
            return Util.getMemberByMixed(str, guild);
        },
    ], true);

    if (!data) {
        if (channel) {
            Util.sendEmbed(channel, 'Mute Failed', 'User not found', Util.makeEmbedFooter(speaker), null, 0x00E676, null);
        } else {
            console.log('Mute failed: Unable to find user');
        }
        return;
    }

    const targetMember = data[0];
    const reason = data[1];

    if (!isWarn) {
        exports.doMute(targetMember, reason, guild, pos, channel, speaker);
    } else {
        exports.doWarn(targetMember, reason, guild, pos, channel, speaker);
    }
};

exports.unMuteName = function (nameParam, isDefinite, guild, pos, channel, speaker) {
    const safeId = Util.getSafeId(nameParam);
    const name = nameParam.toLowerCase();

    const speakerName = Util.isObject(speaker) ? speaker.toString() : speaker;

    const mutedGuild = Data.guildGet(guild, Data.muted);

    let backupTarget;

    console.log(`Unmute Name: ${name}`);

    for (const [targetId] of Object.entries(mutedGuild)) {
        const targetMember = Util.getMemberById(targetId, guild);
        if (targetMember) {
            const targetName = Util.getName(targetMember);
            const targetNick = targetMember.nickname;
            // console.log(targetName);
            if ((safeId && safeId === targetId) || (targetNick != null && (targetNick.toLowerCase().includes(name)))) {
                return exports.unMute(targetMember, guild, pos, channel, speaker);
            } else if (targetName.toLowerCase().includes(name)) {
                backupTarget = targetMember;
            }
        }
    }

    // console.log(name);
    // console.log(backupTarget);

    if (isDefinite) {
        console.log(`Muted user has left so unmute method changed: ${name}`);

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

        exports.stopUnMuteTimeout(safeId, guild);

        return true;
    } else if (backupTarget != null) {
        return exports.unMute(backupTarget, guild, pos, channel, speaker);
    } else if (channel != null) {
        console.log(`(Channel included) Unmute failed: Unable to find muted user (${name}) from ${speakerName}`);
        Util.sendEmbed(channel, 'Unmute Failed', 'User not found', Util.makeEmbedFooter(speaker), null, 0x00E676, null);
    } else {
        console.log(`(Channel not included) Unmute failed: Unable to find muted user (${name}) from ${speakerName}`);
    }

    return true;
};

exports.stopUnMuteTimeout = function (id, guild) {
    const baseGuild = Data.getBaseGuild(guild);
    for (let i = exports.muteEvents.length - 1; i >= 0; i--) {
        const oldTimeout = exports.muteEvents[i];
        if (oldTimeout[0] === id && oldTimeout[1] === baseGuild.id) {
            clearTimeout(oldTimeout[2]);
            console.log(`Removed timeout ${id}`);
            exports.muteEvents.splice(i, 1);
        }
    }
};

exports.addUnMuteEvent = function (id, guild, timeParam, name) {
    const baseGuild = Data.getBaseGuild(guild);

    const time = Math.max(timeParam, 0);

    exports.stopUnMuteTimeout(id, guild);

    const timeoutFunc = function () {
        console.log(`Unmute timeout for ${name} (${id}) has finished @ ${guild.name}`);
        exports.unMuteName(id, true, guild, Infinity, null, 'System');
    };

    guild.fetchMember(id)
    .then(() => {
        console.log(`Started unmute timeout for ${name} (${id}) ${guild.name} - ${time}`);
        exports.muteEvents.push([id, baseGuild.id, setTimeout(timeoutFunc, Math.min(time, 2147483646))]);
    })
    .catch(() => {
        console.log(`Started unmute timeout [User has left] for ${name} (${id}) ${guild.name} - ${time}`);
        exports.muteEvents.push([id, baseGuild.id, setTimeout(timeoutFunc, Math.min(time, 2147483646))]);
    });
};

exports.restartTimeouts = function () {
    const preDate = Date.now();
    const guilds = client.guilds;
    const hasChecked = {};
    for (const [guildId] of Object.entries(Data.muted)) {
        const baseGuild = Data.getBaseGuild(guilds.get(guildId));
        const baseId = baseGuild.id;
        if (!hasChecked[baseId]) {
            hasChecked[baseId] = true;
            const mutedGuild = Data.muted[guildId];
            for (const [targetId] of Object.entries(mutedGuild)) {
                const nowMuted = mutedGuild[targetId];
                exports.addUnMuteEvent(targetId, guilds.get(nowMuted[0]), nowMuted[1] - preDate, nowMuted[2]);
            }
        }
    }
};
