var loadedData = index.loadedData;

exports.guildSaveData = function(obj, retry) {
	if (!loaded[obj]) return;
	var objName = obj.__name;
	var objPath = obj.__path;
	fileSystem.writeFile(objPath, JSON.stringify(obj), (err) => {
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