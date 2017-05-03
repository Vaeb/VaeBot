const FileSys = index.FileSys;

var loadedData = [];
exports.loadedData = loadedData;

const mutesDir = "./data/mutes.json";
const histDir = "./data/history.json";
const autoRoleDir = "./data/autoroles.json";
const playlistDir = "./data/playlist.json";

exports.guildSaveData = function(obj, retry) {
	if (!loadedData[obj]) return;
	var objName = obj.__name;
	var objPath = obj.__path;
	FileSys.writeFile(objPath, JSON.stringify(obj), (err) => {
		if (err) {
			console.log("Error saving " + objName + ": " + err);
			if (!retry) Data.guildSaveData(obj, true);
		} else {
			console.log("Saved: " + objName);
		}
	});
};

exports.guildGet = function(guild, obj, index) {
	if (!obj.hasOwnProperty(guild.id)) obj[guild.id] = {};
	if (index !== null) return obj[guild.id][index];
	return obj[guild.id];
};

exports.guildSet = function(guild, obj, index, value) {
	if (!obj.hasOwnProperty(guild.id)) obj[guild.id] = {};
	obj[guild.id][index] = value;
	Data.guildSaveData(obj);
};

exports.guildDelete = function(guild, obj, index) {
	if (!obj.hasOwnProperty(guild.id)) obj[guild.id] = {};
	if (obj[guild.id].hasOwnProperty(index)) {
		delete obj[guild.id][index];
		Data.guildSaveData(obj);
	}
};

FileSys.readFile(mutesDir, "utf-8", (err, data) => {
	if (err) throw err;

	if (data.length > 0) exports.muted = JSON.parse(data);

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
	loadedData[exports.muted] = true;
});

FileSys.readFile(histDir, "utf-8", (err, data) => {
	if (err) throw err;

	if (data.length > 0) exports.history = JSON.parse(data);

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

	loadedData[exports.history] = true;
});

FileSys.readFile(autoRoleDir, "utf-8", (err, data) => {
	if (err) throw err;

	if (data.length > 0) exports.autoRoles = JSON.parse(data);

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
	loadedData[exports.autoRoles] = true;
});

FileSys.readFile(playlistDir, "utf-8", (err, data) => {
	if (err) throw err;

	if (data.length > 0) exports.playlist = JSON.parse(data);

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
	loadedData[exports.playlist] = true;
	console.log("Loaded data");
});