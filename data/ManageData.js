const FileSys = index.FileSys;

const mutesDir = "./data/mutes.json";
const histDir = "./data/history.json";
const autoRoleDir = "./data/autoroles.json";
const playlistDir = "./data/playlist.json";

var linkGuilds = index.linkGuilds;

exports.loadedData = [];

exports.autoRoles = {};
exports.playlist = {};
exports.history = {};
exports.muted = {};

exports.getLinkedGuilds = function(guild) {
	var linkedGuilds = [guild];

	var guildId = guild.id;

	for (let i = 0; i < linkGuilds.length; i++) {
		let linkData = linkGuilds[i];
		if (linkData.includes(guildId)) {
			for (let i2 = 0; i2 < linkData.length; i2++) {
				let linkedGuildId = linkData[i2];
				if (linkedGuildId != guildId) {
					let linkedGuild = client.guilds.get(linkedGuildId);
					if (linkedGuild) {
						linkedGuilds.push(linkedGuild);
					} else {
						console.log("[CRIT_ERROR_2] Can't resolve linked guild: " + linkedGuildId);
					}
				}
			}
			break;
		}
	}
	
	return linkedGuilds;
};

exports.getBaseGuild = function(guild) {
	var guildId = guild.id;
	
	for (let i = 0; i < linkGuilds.length; i++) {
		let linkData = linkGuilds[i];
		if (linkData.includes(guildId)) {
			let linkedGuildId = linkData[0];
			if (linkedGuildId != guildId) {
				let linkedGuild = client.guilds.get(linkedGuildId);
				if (linkedGuild) {
					return linkedGuild;
				} else {
					console.log("[CRIT_ERROR] Can't resolve linked guild: " + linkedGuildId);
					return null;
				}
			} else {
				return guild;
			}
		}
	}
	
	return guild;
};

exports.guildSaveData = function(obj, retry) {
	if (!exports.loadedData[obj]) return;
	var objName = obj.__name;
	var objPath = obj.__path;
	FileSys.writeFile(objPath, JSON.stringify(obj), (err) => {
		if (err) {
			console.log("Error saving " + objName + ": " + err);
			if (!retry) exports.guildSaveData(obj, true);
		} else {
			console.log("Saved: " + objName);
		}
	});
};

exports.guildGet = function(guild, obj, index) {
	let guildId = guild.id;

	if (!obj.hasOwnProperty(guildId)) obj[guildId] = {};
	if (index != null) return obj[guildId][index];
	return obj[guildId];
};

exports.guildSet = function(guild, obj, index, value) {
	var linkedGuilds = exports.getLinkedGuilds(guild);

	for (let i = 0; i < linkedGuilds.length; i++) {
		let newGuild = linkedGuilds[i];
		let newGuildId = newGuild.id;

		if (!obj.hasOwnProperty(newGuildId)) obj[newGuildId] = {};
		obj[newGuildId][index] = value;
	}

	exports.guildSaveData(obj);
};

exports.guildRun = function(guild, obj, index, func) {
	var linkedGuilds = exports.getLinkedGuilds(guild);

	for (let i = 0; i < linkedGuilds.length; i++) {
		let newGuild = linkedGuilds[i];
		let newGuildId = newGuild.id;

		if (!obj.hasOwnProperty(newGuildId)) obj[newGuildId] = {};

		var result = obj[newGuildId];
		if (index != null) result = obj[newGuildId][index];

		func(result);
	}

	exports.guildSaveData(obj);
};

exports.guildDelete = function(guild, obj, index) {
	var linkedGuilds = exports.getLinkedGuilds(guild);

	for (let i = 0; i < linkedGuilds.length; i++) {
		let newGuild = linkedGuilds[i];
		let newGuildId = newGuild.id;

		if (!obj.hasOwnProperty(newGuildId)) obj[newGuildId] = {};
		if (obj[newGuildId].hasOwnProperty(index)) {
			delete obj[newGuildId][index];
		}
	}

	exports.guildSaveData(obj);
};

FileSys.readFile(autoRoleDir, "utf-8", (err, data) => {
	if (err) throw err;

	if (data.length > 0) {
		let tempObj = JSON.parse(data);
		for (var key in tempObj) {
			if (!tempObj.hasOwnProperty(key)) continue;
			exports.autoRoles[key] = tempObj[key];
		}
	}

	Object.defineProperty(exports.autoRoles, "__name", {
		value: "autoRoles",
		enumerable: false,
		writable: false
	});
	Object.defineProperty(exports.autoRoles, "__path", {
		value: autoRoleDir,
		enumerable: false,
		writable: false
	});
	exports.loadedData[exports.autoRoles] = true;
});

FileSys.readFile(playlistDir, "utf-8", (err, data) => {
	if (err) throw err;

	if (data.length > 0) {
		let tempObj = JSON.parse(data);
		for (var key in tempObj) {
			if (!tempObj.hasOwnProperty(key)) continue;
			exports.playlist[key] = tempObj[key];
		}
	}

	Object.defineProperty(exports.playlist, "__name", {
		value: "playlist",
		enumerable: false,
		writable: false
	});
	Object.defineProperty(exports.playlist, "__path", {
		value: playlistDir,
		enumerable: false,
		writable: false
	});
	exports.loadedData[exports.playlist] = true;
});

FileSys.readFile(histDir, "utf-8", (err, data) => {
	if (err) throw err;

	if (data.length > 0) {
		let tempObj = JSON.parse(data);
		for (var key in tempObj) {
			if (!tempObj.hasOwnProperty(key)) continue;
			exports.history[key] = tempObj[key];
		}
	}

	Object.defineProperty(exports.history, "__name", {
		value: "history",
		enumerable: false,
		writable: false
	});
	Object.defineProperty(exports.history, "__path", {
		value: histDir,
		enumerable: false,
		writable: false
	});

	exports.loadedData[exports.history] = true;
});

FileSys.readFile(mutesDir, "utf-8", (err, data) => {
	if (err) throw err;

	if (data.length > 0) {
		let tempObj = JSON.parse(data);
		for (var key in tempObj) {
			if (!tempObj.hasOwnProperty(key)) continue;
			exports.muted[key] = tempObj[key];
		}
	}

	Object.defineProperty(exports.muted, "__name", {
		value: "muted",
		enumerable: false,
		writable: false
	});
	Object.defineProperty(exports.muted, "__path", {
		value: mutesDir,
		enumerable: false,
		writable: false
	});
	exports.loadedData[exports.muted] = true;

	console.log("Loaded persistent data!");
});