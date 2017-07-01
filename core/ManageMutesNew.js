const DateFormat = index.DateFormat;

const muteTimeouts = [];

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

function sendMuteMessage(guild, channel, userMember, moderator, muteLength, reason, messageType, endStr) { // Send mute log, direct message, etc.
    // Will keep DM as text (rather than embed) to save send time

    if (messageType === 'DM') {
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
            userMember,
            { name: 'Username', value: userMember.toString() },
            { name: 'Moderator', value: moderator.user.username },
            { name: 'Mute Reason', value: reason },
            { name: 'Mute Expires', value: endStr },
            { name: 'Mute History', value: muteLength },
        ];
        Util.sendLog(sendLogData, colAction);
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
            console.log(`Removed timeout for ${userId}`);
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

    muteTimeouts.push({
        'guildId': guild.id,
        'userId': userId,
        'timeout': (setTimeout(() => {
            if (timeoutRemaining > 0) {
                addTimeout(guild, userId, endTick);
                return;
            }

            exports.unMute(guild, null, userId, 'System');
        }, remaining)),
    });
}

function canMute(member, moderator) { // Check if member can be muted
    if (!member) return true;

    const memberPos = Util.getPosition(member);
    const moderatorPos = typeof moderator === 'string' ? Infinity : Util.getPosition(moderator);
    return (moderatorPos > memberPos && member.id !== vaebId) || (Util.isObject(moderator) && moderator.id === vaebId);
}

exports.addMute = async function (guild, channel, userResolvable, moderator, muteLength, reason) { // Add mute
    let userType = 0; // Member
    let userMember = userResolvable;
    let userId = userResolvable;

    if (typeof userResolvable === 'string') userType = 1; // ID

    if (userType === 0) {
        userId = userResolvable.id;
    } else if (userType === 1) {
        userMember = guild.members.get(userResolvable);
    }

    if (muteLength == null) {
        const pastMutes = await Data.getRecords(guild, 'mutes', { user_id: Number(userId) });
        muteLength = exports.defaultMuteLength * (2 ** (pastMutes.length));
    }

    const nowTick = +new Date();
    const endTick = nowTick + muteLength;

    const dateEnd = new Date();
    dateEnd.setTime(Date.now() + muteLength);

    const endStr = `${DateFormat(dateEnd, '[dd/mm/yyyy] HH:MM:ss')} GMT`;

    // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Verify they can be muted

    if (!canMute(userMember, moderator)) {
        return Util.commandFailed(channel, moderator, 'User has equal or higher rank');
    }

    console.log('Can mute');

    // Add their mute to the database

    Data.addRecord(guild, 'mutes', {
        'user_id': Number(userId), // BIGINT
        'mod_id': Number(moderator.id), // BIGINT
        'mute_reason': reason, // TEXT
        'end_tick': endTick, // BIGINT
    });

    console.log('Added mute to database');

    // Add mute timeout (and automatically remove any active timeouts)

    addTimeout(guild, userId, endTick);

    console.log('Added timeout success');

    // Remove SendMessages role

    remSendMessages(userMember);

    console.log('Removed SendMessages');

    // Send the relevant messages

    if (userMember) {
        sendMuteMessage(guild, channel, userMember, moderator, muteLength, reason, 'DM', endStr);
        sendMuteMessage(guild, channel, userMember, moderator, muteLength, reason, 'Log', endStr);
    }

    console.log('Sent DMs');

    return true;
};

exports.changeMute = async function () { // Change a mute's time, reason, etc.

};

exports.unMute = async function (guild, channel, userResolvable, moderator) { // Stop mute early

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
