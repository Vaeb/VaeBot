/*

function (\w+)
exports.$1 = function

*/

exports.doMuteReal = function(targetMember, reason, guild, pos, channel, speaker, noOut, timeScale) {
	var id = targetMember.id;
	var muteName = getName(targetMember);

	if (timeScale === null) timeScale = 2;

	// Get speaker information (if one exists)

	var speakerValid = isObject(speaker);
	var speakerName = speaker;
	var speakerId = null;

	if (speakerValid) {
		speakerName = speaker.toString();
		speakerId = speaker.id;
	}

	// Check if user is allowed to be muted

	if (pos <= getPosition(targetMember)) {
		if (channel !== null) {
			console.log(speakerName + "_User has equal or higher rank");
			commandFailed(channel, speaker, "User has equal or higher rank");
		}
		return false;
	}

	if (speakerValid && (id == vaebId && speakerId != vaebId)) {
		if (channel !== null) {
			commandFailed(channel, speaker, "You cannot mute VaeBot's developer");
		}
		return false;
	}

	// Save mute information to file

	var nowDate = Date.now();
	var muteTime;
	var oldHistory = guildGet(guild, history, id);

	if (oldHistory && (timeScale >= 1 || oldHistory[0] != defaultMuteTime)) {
		muteTime = oldHistory[0]*timeScale;

		if (muteTime < 0) {
			muteTime = oldHistory[0];
		}

		oldHistory[0] = muteTime;
		guildSaveData(history);
	} else {
		muteTime = defaultMuteTime; //1800000
		guildSet(guild, history, id, [muteTime, muteName]);
	}

	var endTime = nowDate+muteTime;

	guildSet(guild, muted, id, [guild.id, endTime, muteName, reason, speakerId]);

	// Add a timeout event for unmuting

	addUnMuteEvent(id, guild, muteTime, muteName);

	// Remove the SendMessages role

	var role = getRole("SendMessages", targetMember);
	if (role !== null) {
		targetMember.removeRole(role)
		.catch(error => console.log("\n[E_RoleRem1] " + error));
	}

	// Save the mute for briefing

	var timeRemaining = historyToString(muteTime);
	if (guild.id == "168742643021512705") {
		dailyMutes.push([id, muteName + "#" + targetMember.discriminator, reason, timeRemaining]);
	}

	// Embed mute information in channel

	var d = new Date();
	d.setTime(endTime);
	var endStr = "[" + getDayStr(d) + "/" + getMonthStr(d) + "/" + getYearStr(d) + "] " + getHourStr(d) + ":" + getMinStr(d) + " GMT";

	if (channel && !noOut) {
		var sendEmbedFields = [
			{name: "Username", value: getMention(targetMember)},
			{name: "Mute Reason", value: reason},
			{name: "Mute Expires", value: endStr},
			{name: "Time Remaining", value: timeRemaining}
		];
		sendEmbed(channel, "User Muted", null, makeEmbedFooter(speaker), getAvatar(targetMember), 0x00E676, sendEmbedFields);
	}

	/*
	sendEmbed(
		Channel Object,
		Title String,
		Description String,
		Username + ID String,
		Avatar URL String,
		Color Number,
		Fields Array
	);
	*/

	// Embed mute information in log

	var sendLogData = [
		"User Muted",
		guild,
		targetMember,
		{name: "Username", value: targetMember.toString()},
		{name: "Moderator", value: speakerName},
		{name: "Mute Reason", value: reason},
		{name: "Mute Expires", value: endStr},
		{name: "Mute History", value: timeRemaining}
	];
	sendLog(sendLogData, colAction);

	// DM muted user with mute information

	var outStr = ["**You have been muted**\n```"];
	outStr.push("Guild: " + guild.name);
	outStr.push("Reason: " + reason);
	outStr.push("Mute expires: " + endStr);
	outStr.push("Time remaining: " + timeRemaining);
	outStr.push("```");
	print(targetMember, outStr.join("\n"));

	return timeRemaining;
};

exports.unMuteReal = function(targetMember, guild, pos, channel, speaker) {
	var id = targetMember.id;

	var speakerValid = isObject(speaker);
	var speakerName = speaker;
	var speakerId = null;

	if (speakerValid) {
		speakerName = speaker.toString();
		speakerId = speaker.id;
	}

	if (speakerId != vaebId && pos <= getPosition(targetMember)) {
		if (channel !== null) {
			console.log(speakerName + "_User has equal or higher rank");
			commandFailed(channel, speaker, "User has equal or higher rank");
		}
		return false;
	}

	var mutedData = guildGet(guild, muted, id);
	var origModId = mutedData[4];
	var origMod = getMemberById(origModId, guild);
	var origModPos = origMod !== null ? getPosition(origMod) : -1;

	if (speakerValid && speakerId != vaebId && speakerId != selfId && (origModId == vaebId || pos < origModPos)) {
		if (channel !== null) {
			console.log(speakerName + "_Moderator who muted has higher privilege");
			commandFailed(channel, speaker, "Moderator who muted has higher privilege");
		}
		return false;
	}

	guildDelete(guild, muted, id);

	var role = getRole("SendMessages", guild);
	if (role !== null) {
		targetMember.addRole(role)
		.catch(error => console.log("\n[E_AddRem1] " + error));
	}

	var muteName = getName(targetMember);

	var muteHistoryString = historyToString(getHistory(targetMember.id, guild));

	if (pos == Infinity) {
		console.log("Unmuted " + muteName);
	} else if (channel !== null) {
		var sendEmbedFields = [
			{name: "Username", value: getMention(targetMember)},
			{name: "Mute History", value: muteHistoryString}
		];

		sendEmbed(channel, "User Unmuted", null, makeEmbedFooter(speaker), getAvatar(targetMember), 0x00E676, sendEmbedFields);
	}

	var sendLogData = [
		"User Unmuted",
		guild,
		targetMember,
		{name: "Username", value: targetMember.toString()},
		{name: "Moderator", value: speakerName},
		{name: "Mute History", value: muteHistoryString}
	];
	sendLog(sendLogData, colAction);

	var outStr = ["**You have been unmuted**\n```"];
	outStr.push("Guild: " + guild.name);
	outStr.push("```");
	print(targetMember, outStr.join("\n"));

	stopUnMuteTimeout(id);

	return true;
};

exports.doMute = function(name, guild, pos, channel, speaker) {
	var data = getDataFromString(name, [
		function(str, results) {
			return getMemberByMixed(str, guild);
		},
	], true);

	if (!data) {
		if (channel) {
			sendEmbed(channel, "Mute Failed", "User not found", makeEmbedFooter(speaker), null, 0x00E676, null);
		} else {
			console.log("Mute failed: Unable to find user");
		}
		return;
	}

	var targetMember = data[0];
	var reason = data[1];
	doMuteReal(targetMember, reason, guild, pos, channel, speaker);
};

exports.unMute = function(name, isDefinite, guild, pos, channel, speaker) {
	var backupTarget;
	var safeId = getSafeId(name);
	name = name.toLowerCase();

	var speakerName = isObject(speaker) ? speaker.toString() : speaker;

	var mutedGuild = guildGet(guild, muted);

	for (var targetId in mutedGuild) {
		if (!mutedGuild.hasOwnProperty(targetId)) continue;
		var targetMember = getMemberById(targetId, guild);
		if (targetMember) {
			var targetName = getName(targetMember);
			var targetNick = targetMember.nickname;
			//console.log(targetName);
			if ((safeId && safeId == targetId) || (targetNick !== null && (targetNick.toLowerCase().includes(name)))) {
				return unMuteReal(targetMember, guild, pos, channel, speaker);
			} else if (targetName.toLowerCase().includes(name)) {
				backupTarget = targetMember;
			}
		}
	}

	//console.log(name);
	//console.log(backupTarget);

	if (isDefinite) {
		console.log("Muted user has left so unmute method changed: " + name);

		guildDelete(guild, muted, safeId);

		var muteHistoryString = historyToString(getHistory(safeId, guild));

		var sendLogData = [
			"User Unmuted (User Left)",
			guild,
			null,
			{name: "Username", value: "<@" + name + ">"},
			{name: "Moderator", value: speakerName},
			{name: "Mute History", value: muteHistoryString}
		];

		console.log(name + " " + speakerName + " " + muteHistoryString);

		sendLog(sendLogData, colAction);

		stopUnMuteTimeout(safeId);

		console.log("Success");
	}

	if (backupTarget !== null) {
		return unMuteReal(backupTarget, guild, pos, channel, speaker);
	} else if (channel !== null) {
		console.log("(Channel included) Unmute failed: Unable to find muted user (" + name + ")");
		sendEmbed(channel, "Unmute Failed", "User not found", makeEmbedFooter(speaker), null, 0x00E676, null);
	} else {
		console.log("(Channel not included) Unmute failed: Unable to find muted user (" + name + ")");
	}

	return false;
};

exports.stopUnMuteTimeout = function(id) {
	for (var i = muteEvents.length-1; i >= 0; i--) {
		var oldTimeout = muteEvents[i];
		if (oldTimeout[0] == id) {
			clearTimeout(oldTimeout[1]);
			console.log("removed timeout " + id);
			muteEvents.splice(i, 1);
		}
	}
};

exports.addUnMuteEvent = function(id, guild, time, name) {
	time = Math.max(time, 0);
	stopUnMuteTimeout(id);
	guild.fetchMember(id)
	.then(member => {
		console.log("started timeout " + name + " " + id + " " + guild + " - " + time);
		muteEvents.push([id, setTimeout(function() {
			unMute(id, true, guild, Infinity, null, "System");
		}, Math.min(time, 2147483646))]);
	})
	.catch(error => {
		console.log("started timeout but user has left " + name + " " + id + " " + guild + " - " + time);
		muteEvents.push([id, setTimeout(function() {
			unMute(id, true, guild, Infinity, null, "System");
		}, Math.min(time, 2147483646))]);
	});
};

exports.restartTimeouts = function() {
	var preDate = Date.now();
	var guilds = client.guilds;
	for (var guildId in muted) {
		if (!muted.hasOwnProperty(guildId)) continue;
		var mutedGuild = muted[guildId];
		for (var targetId in mutedGuild) {
			if (!mutedGuild.hasOwnProperty(targetId)) continue;
			var nowMuted = mutedGuild[targetId];
			addUnMuteEvent(targetId, guilds.get(nowMuted[0]), nowMuted[1]-preDate, nowMuted[2]);
		}
	}
};