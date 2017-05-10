const FileSys = index.FileSys;

var loadedData = Data.loadedData;;
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
	return (Data.guildGet(guild, Data.muted, id) ? true : false);
}

exports.removeSend = function(member) {
	var guild = member.guild;
	var linkedGuilds = Data.getLinkedGuilds(guild);
	var memberId = member.id;

	for (let i = 0; i < linkedGuilds.length; i++) {
		let linkedGuild = linkedGuilds[i];
		let linkedMember = Util.getMemberById(memberId, linkedGuild);

		if (linkedMember) {
			let role = Util.getRole("SendMessages", linkedMember);
			if (role != null) {
				linkedMember.removeRole(role)
				.then(() => {
					console.log("Link-removed SendMessages from " + Util.getName(linkedMember) + " @ " + linkedGuild.name);
				})
				.catch(error => console.log("\n[E_LinkRoleRem1] " + error));
			}
		}
	}
};

exports.addSend = function(member) {
	var guild = member.guild;
	var linkedGuilds = Data.getLinkedGuilds(guild);
	var memberId = member.id;

	for (let i = 0; i < linkedGuilds.length; i++) {
		let linkedGuild = linkedGuilds[i];
		let linkedMember = Util.getMemberById(memberId, linkedGuild);

		if (linkedMember) {
			let role = Util.getRole("SendMessages", linkedGuild);
			if (role != null) {
				linkedMember.addRole(role)
				.then(() => {
					console.log("Link-added SendMessages to " + Util.getName(linkedMember) + " @ " + linkedGuild.name);
				})
				.catch(error => console.log("\n[E_LinkRoleAdd1] " + error));
			}
		}
	}
};

exports.checkMuted = function(id, guild) {
	var isMuted = checkMutedInner(id, guild);

	if (!isMuted) {
		var guildId = guild.id;
		var linkedGuilds = Data.getLinkedGuilds(guild);

		for (let i = 0; i < linkedGuilds.length; i++) {
			let linkedGuild = linkedGuilds[i];
			let linkedGuildId = linkedGuild.id;
			
			if (linkedGuildId != guildId) {
				isMuted = checkMutedInner(id, linkedGuild);
				if (isMuted) break;
			}
		}
	}

	return isMuted;
};

exports.doMuteReal = function(targetMember, reason, guild, pos, channel, speaker, noOut, timeScale) {
	var id = targetMember.id;
	var muteName = Util.getName(targetMember);

	if (timeScale == null) timeScale = 2;

	// Get speaker information (if one exists)

	var speakerValid = Util.isObject(speaker);
	var speakerName = speaker;
	var speakerId = null;

	if (speakerValid) {
		speakerName = speaker.toString();
		speakerId = speaker.id;
	}

	// Check if user is allowed to be muted

	if (pos <= Util.getPosition(targetMember)) {
		if (channel != null) {
			console.log(speakerName + "_User has equal or higher rank");
			Util.commandFailed(channel, speaker, "User has equal or higher rank");
		}
		return false;
	}

	if (speakerValid && (id == vaebId && speakerId != vaebId)) {
		if (channel != null) {
			Util.commandFailed(channel, speaker, "You cannot mute VaeBot's developer");
		}
		return false;
	}

	// Save mute information to file

	var nowDate = Date.now();
	var muteTime;

	var oldHistory = Data.guildGet(guild, Data.history, id);

	if (oldHistory && (timeScale >= 1 || oldHistory[0] != exports.defaultMuteTime)) {
		muteTime = oldHistory[0]*timeScale;

		if (muteTime < 0) muteTime = oldHistory[0];

		Data.guildRun(guild, Data.history, id, (result => {
			result[0] = muteTime;
		}));
	} else {
		muteTime = exports.defaultMuteTime; //1800000

		Data.guildSet(guild, Data.history, id, [muteTime, muteName]);
	}

	var endTime = nowDate+muteTime;

	Data.guildSet(guild, Data.muted, id, [guild.id, endTime, muteName, reason, speakerId]);

	// Finalise mute

	exports.addUnMuteEvent(id, guild, muteTime, muteName);

	Events.emit(guild, "UserMute", targetMember, reason, muteTime, speakerId);

	exports.removeSend(targetMember);

	// Save the mute for briefing

	var timeRemaining = Util.historyToString(muteTime);
	if (guild.id == "168742643021512705") {
		index.dailyMutes.push([id, muteName + "#" + targetMember.discriminator, reason, timeRemaining]);
	}

	// Embed mute information in channel

	var d = new Date();
	d.setTime(endTime);
	var endStr = "[" + Util.getDayStr(d) + "/" + Util.getMonthStr(d) + "/" + Util.getYearStr(d) + "] " + Util.getHourStr(d) + ":" + Util.getMinStr(d) + " GMT";

	if (channel && !noOut) {
		var sendEmbedFields = [
			{name: "Username", value: Util.getMention(targetMember)},
			{name: "Mute Reason", value: reason},
			{name: "Mute Expires", value: endStr},
			{name: "Time Remaining", value: timeRemaining}
		];
		Util.sendEmbed(channel, "User Muted", null, Util.makeEmbedFooter(speaker), Util.getAvatar(targetMember), 0x00E676, sendEmbedFields);
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
	Util.sendLog(sendLogData, colAction);

	// DM muted user with mute information

	var outStr = ["**You have been muted**\n```"];
	outStr.push("Guild: " + guild.name);
	outStr.push("Reason: " + reason);
	outStr.push("Mute expires: " + endStr);
	outStr.push("Time remaining: " + timeRemaining);
	outStr.push("```");
	Util.print(targetMember, outStr.join("\n"));

	return timeRemaining;
};

exports.unMuteReal = function(targetMember, guild, pos, channel, speaker) {
	var id = targetMember.id;

	var speakerValid = Util.isObject(speaker);
	var speakerName = speaker;
	var speakerId = null;

	if (speakerValid) {
		speakerName = speaker.toString();
		speakerId = speaker.id;
	}

	if (speakerId != vaebId && pos <= Util.getPosition(targetMember)) {
		if (channel != null) {
			console.log(speakerName + "_User has equal or higher rank");
			Util.commandFailed(channel, speaker, "User has equal or higher rank");
		}
		return false;
	}

	var mutedData = Data.guildGet(guild, Data.muted, id);
	var origModId = mutedData[4];
	var origMod = Util.getMemberById(origModId, guild);
	var origModPos = origMod != null ? Util.getPosition(origMod) : -1;

	if (speakerValid && speakerId != vaebId && speakerId != selfId && (origModId == vaebId || pos < origModPos)) {
		if (channel != null) {
			console.log(speakerName + "_Moderator who muted has higher privilege");
			Util.commandFailed(channel, speaker, "Moderator who muted has higher privilege");
		}
		return false;
	}

	Data.guildDelete(guild, Data.muted, id);

	var muteHistory = Util.getHistory(targetMember.id, guild);
	var muteHistoryString = Util.historyToString(muteHistory);

	// Finalise unmute

	exports.stopUnMuteTimeout(id, guild);

	Events.emit(guild, "UserUnMute", targetMember, muteHistory, speakerId);
	
	exports.addSend(targetMember);

	// Output

	var muteName = Util.getName(targetMember);

	if (pos == Infinity) {
		console.log("Unmuted " + muteName);
	} else if (channel != null) {
		var sendEmbedFields = [
			{name: "Username", value: Util.getMention(targetMember)},
			{name: "Mute History", value: muteHistoryString}
		];

		Util.sendEmbed(channel, "User Unmuted", null, Util.makeEmbedFooter(speaker), Util.getAvatar(targetMember), 0x00E676, sendEmbedFields);
	}

	var sendLogData = [
		"User Unmuted",
		guild,
		targetMember,
		{name: "Username", value: targetMember.toString()},
		{name: "Moderator", value: speakerName},
		{name: "Mute History", value: muteHistoryString}
	];
	Util.sendLog(sendLogData, colAction);

	var outStr = ["**You have been unmuted**\n```"];
	outStr.push("Guild: " + guild.name);
	outStr.push("```");
	Util.print(targetMember, outStr.join("\n"));

	return true;
};

exports.doMute = function(name, guild, pos, channel, speaker) {
	var data = Util.getDataFromString(name, [
		function(str, results) {
			return Util.getMemberByMixed(str, guild);
		},
	], true);

	if (!data) {
		if (channel) {
			Util.sendEmbed(channel, "Mute Failed", "User not found", Util.makeEmbedFooter(speaker), null, 0x00E676, null);
		} else {
			console.log("Mute failed: Unable to find user");
		}
		return;
	}

	var targetMember = data[0];
	var reason = data[1];
	exports.doMuteReal(targetMember, reason, guild, pos, channel, speaker);
};

exports.unMute = function(name, isDefinite, guild, pos, channel, speaker) {
	var backupTarget;
	var safeId = Util.getSafeId(name);
	name = name.toLowerCase();

	var speakerName = Util.isObject(speaker) ? speaker.toString() : speaker;

	var mutedGuild = Data.guildGet(guild, Data.muted);

	console.log("Unmute Name: " + name);

	for (var targetId in mutedGuild) {
		if (!mutedGuild.hasOwnProperty(targetId)) continue;
		var targetMember = Util.getMemberById(targetId, guild);
		if (targetMember) {
			var targetName = Util.getName(targetMember);
			var targetNick = targetMember.nickname;
			//console.log(targetName);
			if ((safeId && safeId == targetId) || (targetNick != null && (targetNick.toLowerCase().includes(name)))) {
				return exports.unMuteReal(targetMember, guild, pos, channel, speaker);
			} else if (targetName.toLowerCase().includes(name)) {
				backupTarget = targetMember;
			}
		}
	}

	//console.log(name);
	//console.log(backupTarget);

	if (isDefinite) {
		console.log("Muted user has left so unmute method changed: " + name);

		Data.guildDelete(guild, Data.muted, safeId);

		var muteHistoryString = Util.historyToString(Util.getHistory(safeId, guild));

		var sendLogData = [
			"User Unmuted (User Left)",
			guild,
			null,
			{name: "Username", value: "<@" + name + ">"},
			{name: "Moderator", value: speakerName},
			{name: "Mute History", value: muteHistoryString}
		];

		Util.sendLog(sendLogData, colAction);

		exports.stopUnMuteTimeout(safeId, guild);

		return true;
	} else if (backupTarget != null) {
		return exports.unMuteReal(backupTarget, guild, pos, channel, speaker);
	} else if (channel != null) {
		console.log("(Channel included) Unmute failed: Unable to find muted user (" + name + ") from " + speakerName);
		Util.sendEmbed(channel, "Unmute Failed", "User not found", Util.makeEmbedFooter(speaker), null, 0x00E676, null);
	} else {
		console.log("(Channel not included) Unmute failed: Unable to find muted user (" + name + ") from " + speakerName);
	}

	return true;
};

exports.stopUnMuteTimeout = function(id, guild) {
	var baseGuild = Data.getBaseGuild(guild);
	for (var i = exports.muteEvents.length-1; i >= 0; i--) {
		var oldTimeout = exports.muteEvents[i];
		if (oldTimeout[0] == id && oldTimeout[1] == baseGuild.id) {
			clearTimeout(oldTimeout[2]);
			console.log("Removed timeout " + id);
			exports.muteEvents.splice(i, 1);
		}
	}
};

exports.addUnMuteEvent = function(id, guild, time, name) {
	var baseGuild = Data.getBaseGuild(guild);

	time = Math.max(time, 0);

	exports.stopUnMuteTimeout(id, guild);

	let timeoutFunc = function() {
		console.log("Unmute timeout for " + name + " (" + id + ") has finished @ " + guild.name);
		exports.unMute(id, true, guild, Infinity, null, "System");
	};

	guild.fetchMember(id)
	.then(member => {
		console.log("Started unmute timeout for " + name + " (" + id + ") " + guild.name + " - " + time);
		exports.muteEvents.push([id, baseGuild.id, setTimeout(timeoutFunc, Math.min(time, 2147483646))]);
	})
	.catch(error => {
		console.log("Started unmute timeout [User has left] for " + name + " (" + id + ") " + guild.name + " - " + time);
		exports.muteEvents.push([id, baseGuild.id, setTimeout(timeoutFunc, Math.min(time, 2147483646))]);
	});
};

exports.restartTimeouts = function() {
	var preDate = Date.now();
	var guilds = client.guilds;
	var hasChecked = {};
	for (var guildId in Data.muted) {
		if (!Data.muted.hasOwnProperty(guildId)) continue;
		var baseGuild = Data.getBaseGuild(guilds.get(guildId));
		var baseId = baseGuild.id;
		if (hasChecked.hasOwnProperty(baseId)) continue;
		hasChecked[baseId] = true; 
		var mutedGuild = Data.muted[guildId];
		for (var targetId in mutedGuild) {
			if (!mutedGuild.hasOwnProperty(targetId)) continue;
			var nowMuted = mutedGuild[targetId];
			exports.addUnMuteEvent(targetId, guilds.get(nowMuted[0]), nowMuted[1]-preDate, nowMuted[2]);
		}
	}
};
