var loadedData = index.loadedData;

global.guildSaveData = function(obj, retry) {
	if (!loadedData[obj]) return;
	var objName = obj.__name;
	var objPath = obj.__path;
	fileSystem.writeFile(objPath, JSON.stringify(obj), (err) => {
		if (err) {
			console.log("Error saving " + objName + ": " + err);
			if (!retry) guildSaveData(obj, true);
		} else {
			console.log("Saved: " + objName);
		}
	});
};

global.guildGet = function(guild, obj, index) {
	if (!obj.hasOwnProperty(guild.id)) obj[guild.id] = {};
	if (index !== null) return obj[guild.id][index];
	return obj[guild.id];
};

global.guildSet = function(guild, obj, index, value) {
	if (!obj.hasOwnProperty(guild.id)) obj[guild.id] = {};
	obj[guild.id][index] = value;
	guildSaveData(obj);
};

global.guildDelete = function(guild, obj, index) {
	if (!obj.hasOwnProperty(guild.id)) obj[guild.id] = {};
	if (obj[guild.id].hasOwnProperty(index)) {
		delete obj[guild.id][index];
		guildSaveData(obj);
	}
};