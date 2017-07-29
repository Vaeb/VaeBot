const FileSys = index.FileSys;

const mutesDir = '/home/flipflop8421/files/discordExp/VaeBot/data/mutes.json';
const histDir = '/home/flipflop8421/files/discordExp/VaeBot/data/history.json';
const autoRoleDir = '/home/flipflop8421/files/discordExp/VaeBot/data/autoroles.json';
const playlistDir = '/home/flipflop8421/files/discordExp/VaeBot/data/playlist.json';

const linkGuilds = index.linkGuilds;

exports.loadedData = [];

exports.autoRoles = {};
exports.playlist = {};
exports.history = {};
exports.muted = {};

exports.cache = {};

exports.autoInc = {
    'mutes': 0,
    'bans': 0,
};

exports.getLinkedGuilds = function (guild) {
    if (guild == null) return [];

    const linkedGuilds = [guild];

    const guildId = guild.id;

    for (let i = 0; i < linkGuilds.length; i++) {
        const linkData = linkGuilds[i];
        if (linkData.includes(guildId)) {
            for (let i2 = 0; i2 < linkData.length; i2++) {
                const linkedGuildId = linkData[i2];
                if (linkedGuildId !== guildId) {
                    const linkedGuild = client.guilds.get(linkedGuildId);
                    if (linkedGuild) {
                        linkedGuilds.push(linkedGuild);
                    } else {
                        Util.log(`[CRIT_ERROR_2] Can't resolve linked guild: ${linkedGuildId}`);
                    }
                }
            }
            break;
        }
    }

    return linkedGuilds;
};

exports.getBaseGuild = function (guild) {
    if (guild == null) return null;

    const guildId = guild.id;

    for (let i = 0; i < linkGuilds.length; i++) {
        const linkData = linkGuilds[i];
        if (linkData.includes(guildId)) {
            const linkedGuildId = linkData[0];
            if (linkedGuildId !== guildId) {
                const linkedGuild = client.guilds.get(linkedGuildId);
                if (linkedGuild) {
                    return linkedGuild;
                }
                Util.log(`[CRIT_ERROR] Can't resolve linked guild: ${linkedGuildId}`);
                return null;
            }
            return guild;
        }
    }

    return guild;
};

exports.getBaseGuildId = function (guildId) {
    if (guildId == null) return null;

    for (let i = 0; i < linkGuilds.length; i++) {
        const linkData = linkGuilds[i];
        if (linkData.includes(guildId)) {
            return linkData[0];
        }
    }

    return guildId;
};

exports.guildSaveData = function (obj/* , retry */) {
    if (!exports.loadedData[obj]) return;
    const objName = obj.__name;
    const objPath = obj.__path;
    const objStr = JSON.stringify(obj);
    // if (objName === 'muted') Util.log(`SavedMutedDebug: ${objStr}`);
    const stream = FileSys.createWriteStream(objPath);
    stream.once('open', () => {
        stream.write(objStr);
        stream.end();
        Util.log(`Saved: ${objName}`);
    });
    /* FileSys.writeFile(objPath, objStr, (err) => {
        if (err) {
            Util.log(`Error saving ${objName}: ${err}`);
            if (!retry) exports.guildSaveData(obj, true);
        } else {
            Util.log(`Saved: ${objName}`);
        }
    }); */
};

exports.guildGet = function (guild, obj, index) {
    const guildId = guild.id;

    if (!Object.prototype.hasOwnProperty.call(obj, guildId)) obj[guildId] = {};
    if (index != null) return obj[guildId][index];
    return obj[guildId];
};

exports.guildSet = function (guild, obj, index, value) {
    const linkedGuilds = exports.getLinkedGuilds(guild);

    for (let i = 0; i < linkedGuilds.length; i++) {
        const newGuild = linkedGuilds[i];
        const newGuildId = newGuild.id;

        if (!Object.prototype.hasOwnProperty.call(obj, newGuildId)) obj[newGuildId] = {};
        obj[newGuildId][index] = value;
    }

    exports.guildSaveData(obj);
};

exports.guildRun = function (guild, obj, index, func) {
    const linkedGuilds = exports.getLinkedGuilds(guild);

    for (let i = 0; i < linkedGuilds.length; i++) {
        const newGuild = linkedGuilds[i];
        const newGuildId = newGuild.id;

        if (!Object.prototype.hasOwnProperty.call(obj, newGuildId)) obj[newGuildId] = {};

        let result = obj[newGuildId];
        if (index != null) result = obj[newGuildId][index];

        func(result);
    }

    exports.guildSaveData(obj);
};

exports.guildDelete = function (guild, obj, index) {
    const linkedGuilds = exports.getLinkedGuilds(guild);

    for (let i = 0; i < linkedGuilds.length; i++) {
        const newGuild = linkedGuilds[i];
        const newGuildId = newGuild.id;

        if (!Object.prototype.hasOwnProperty.call(obj, newGuildId)) obj[newGuildId] = {};
        if (Object.prototype.hasOwnProperty.call(obj[newGuildId], index)) {
            delete obj[newGuildId][index];
        }
    }

    exports.guildSaveData(obj);
};

exports.emptyPromise = function () {
    return new Promise((resolve) => {
        resolve([]);
    });
};

exports.fromBuffer = function (buffer) {
    return buffer.readUIntBE(0, 1);
};

let connection;

exports.query = function (statement, inputs) {
    return new Promise((resolve, reject) => {
        connection.query(statement, inputs, (err, result, resultData) => {
            if (err) return reject(err);
            return resolve(result, resultData);
        });
    });
};

exports.connect = function () {
    connection = index.MySQL.createConnection({
        host: 'localhost',
        user: 'vaebot',
        password: index.dbPass,
        database: 'veil',
        multipleStatements: true,
        charset: 'utf8mb4',
    });

    exports.connection = connection;

    return new Promise((resolve, reject) => {
        Util.logc('MySQL', '[MySQL] Connecting...');
        connection.connect((err) => {
            if (err) return reject(err);
            return resolve();
        });

        connection.on('error', (err) => {
            if (err.fatal) {
                Util.logc('MySQL', `[MySQL] Fatal error: ${err.code}`);
                Util.logc('MySQL', '[MySQL] Attempting to reconnect...');
                exports.connect();
            } else {
                Util.log(`Non-fatal error: ${err.code}`);
            }
        });
    });
};

/*

    Record/Row = { user_id: '123', mute_id: '456' }
    Column = 'user_id'
    Value = '123'

*/

/* function dataToString(value) {
    if (typeof value === 'string') {
        return `'${value}'`;
    }
    return `${value}`;
} */

// SELECT * FROM members WHERE user_id='107593015014486016';


function getRecordsFromCache(nowCache, identity) {
    const results = [];

    if (!identity) identity = {};

    for (const nowRecord of Object.values(nowCache)) {
        let idMatch = true;

        for (const [idColumn, idValueData] of Object.entries(identity)) {
            idMatch = false;

            const nowValue = nowRecord[idColumn];

            let idValue = idValueData;
            let operator = '=';

            if (Util.isObject(idValueData)) {
                idValue = idValueData.value;
                operator = idValueData.operator || '=';
            }

            switch (operator) {
            case '=':
                idMatch = nowValue == idValue;
                break;
            case '!=':
                idMatch = nowValue != idValue;
                break;
            case '>':
                idMatch = nowValue > idValue;
                break;
            case '>=':
                idMatch = nowValue >= idValue;
                break;
            case '<':
                idMatch = nowValue < idValue;
                break;
            case '<=':
                idMatch = nowValue <= idValue;
                break;
            }

            if (!idMatch) break;
        }

        if (!idMatch) break;

        results.push(nowRecord);
    }

    return results;
}

exports.getTableNames = async function () {
    return (await Data.query('SELECT table_name FROM information_schema.tables where table_schema=DATABASE();')).map(tableData => tableData.table_name);
};

exports.fetchPrimaryKey = async function (tableName) {
    return (await Data.query(`show index from ${tableName} where Key_name = 'PRIMARY';`))[0].Column_name;
};

exports.fetchAutoIncKey = async function (tableName) {
    return (await Data.query('SELECT AUTO_INCREMENT FROM information_schema.tables WHERE table_name=? AND table_schema=DATABASE();', [tableName]))[0].AUTO_INCREMENT;
};

exports.updateCache = async function (updateTableName) {
    const matchNames = updateTableName ? [updateTableName] : (await exports.getTableNames());
    await Promise.all(matchNames.map(async (tableName) => {
        const tableRecords = await exports.query(`SELECT * FROM ${tableName}`);
        if (tableRecords.length > 0 && !tableRecords[0].guild_id) return;
        if (!exports.cache[tableName]) {
            exports.cache[tableName] = {};
            exports.cache[tableName]._primaryKey = await exports.fetchPrimaryKey(tableName);
        }
        const primaryColumn = exports.cache[tableName]._primaryKey;
        for (let i = 0; i < tableRecords.length; i++) {
            const record = tableRecords[i];
            const guildId = record.guild_id;
            if (!exports.cache[tableName][guildId]) exports.cache[tableName][guildId] = {};
            exports.cache[tableName][guildId][record[primaryColumn]] = Util.cloneObj(record);
        }
    }));
};

exports.getCache = async function (guildId, tableName) {
    if (!exports.cache[tableName]) await exports.updateCache(tableName);
    if (!exports.cache[tableName][guildId]) exports.cache[tableName][guildId] = {};
    return [exports.cache[tableName][guildId], exports.cache[tableName]._primaryKey];
};

exports.initAutoInc = async function () {
    const promises = [];

    for (const tableName of Object.keys(exports.autoInc)) {
        promises.push([tableName, exports.fetchAutoIncKey(tableName)]);
    }

    await Promise.all(promises.map(async (data) => {
        exports.autoInc[data[0]] = await data[1];
    }));
};

exports.nextInc = function (tableName) {
    return ++exports.autoInc[tableName];
};

exports.getRecords = async function (guild, tableName, identity, fromSQL) { // DBFunc
    const guildId = exports.getBaseGuildId(guild.id);

    if (!fromSQL) {
        const [nowCache] = await exports.getCache(guildId, tableName);

        const results = getRecordsFromCache(nowCache, identity);

        return results;
    }

    let conditionStr = ['guild_id=?'];
    const valueArr = [guildId];

    if (identity) {
        for (const [column, valueData] of Object.entries(identity)) {
            let value = valueData;
            let operator = '=';

            if (Util.isObject(valueData)) {
                value = valueData.value;
                operator = valueData.operator || '=';
            }

            conditionStr.push(`${column}${operator}?`);
            valueArr.push(value);
        }
    }

    conditionStr = conditionStr.join(' AND ');

    const queryStr = `SELECT * FROM ${tableName} WHERE ${conditionStr};`;
    // Util.log(queryStr);

    return exports.query(queryStr, valueArr);
};

exports.deleteRecords = async function (guild, tableName, identity) { // DBFunc
    const guildId = exports.getBaseGuildId(guild.id);

    const [nowCache, primaryColumn] = await exports.getCache(guildId, tableName);

    const results = getRecordsFromCache(nowCache, identity);

    for (let i = 0; i < results.length; i++) {
        const nowPrimaryValue = results[i][primaryColumn];
        delete nowCache[nowPrimaryValue];
    }

    let conditionStr = ['guild_id=?'];
    const valueArr = [guildId];

    for (const [column, valueData] of Object.entries(identity)) {
        let value = valueData;
        let operator = '=';

        if (Util.isObject(valueData)) {
            value = valueData.value;
            operator = valueData.operator || '=';
        }

        conditionStr.push(`${column}${operator}?`);
        valueArr.push(value);
    }

    conditionStr = conditionStr.join(' AND ');

    const queryStr = `DELETE FROM ${tableName} WHERE ${conditionStr};`;
    // Util.log(queryStr);

    return exports.query(queryStr, valueArr);
};

exports.updateRecords = async function (guild, tableName, identity, data) { // DBFunc
    const guildId = exports.getBaseGuildId(guild.id);

    const [nowCache] = await exports.getCache(guildId, tableName);

    const results = getRecordsFromCache(nowCache, identity);

    Object.entries(data).forEach(([column, value]) => {
        for (let i = 0; i < results.length; i++) {
            results[i][column] = value;
        }
    });

    let updateStr = [];
    let conditionStr = ['guild_id=?'];
    const valueArr = [];

    for (const [column, value] of Object.entries(data)) {
        updateStr.push(`${column}=?`);
        valueArr.push(value);
    }

    valueArr.push(guildId);

    if (identity) {
        for (const [column, valueData] of Object.entries(identity)) {
            let value = valueData;
            let operator = '=';

            if (Util.isObject(valueData)) {
                value = valueData.value;
                operator = valueData.operator || '=';
            }

            conditionStr.push(`${column}${operator}?`);
            valueArr.push(value);
        }
    }

    updateStr = updateStr.join(',');
    conditionStr = conditionStr.join(' AND ');

    const queryStr = `UPDATE ${tableName} SET ${updateStr} WHERE ${conditionStr};`;

    // Util.log(queryStr);
    // Util.log(valueArr);

    return exports.query(queryStr, valueArr);
};

/* exports.addRecord = function (guild, tableName, data) {
    const guildId = exports.getBaseGuildId(guild.id);

    let columnStr = ['guild_id'];
    let valueStr = ['?'];
    const valueArr = [guildId];

    for (const [column, value] of Object.entries(data)) {
        columnStr.push(column);
        valueStr.push('?');
        valueArr.push(value);
    }

    columnStr = columnStr.join(',');
    valueStr = valueStr.join(',');

    const queryStr = `INSERT INTO ${tableName}(${columnStr}) VALUES(${valueStr});`;

    return exports.query(queryStr, valueArr);
}; */

/*

    nowCache: {
        tableName: {
            _primaryKey: ...
            guildId: {
                '123': { user_id: '123', ...: ... }
                '456': { user_id: '456', ...: ... }
            }
        }
    }

*/

exports.addRecord = async function (guild, tableName, data) { // DBFunc
    const guildId = exports.getBaseGuildId(guild.id);

    const [nowCache, primaryColumn] = await exports.getCache(guildId, tableName);

    let columnStr = ['guild_id'];
    let valueStr = ['?'];
    let setStr = ['guild_id=?'];
    const valueArr = [guildId];

    const updateData = has.call(data, primaryColumn) && has.call(nowCache, data[primaryColumn]);

    for (const [column, value] of Object.entries(data)) {
        columnStr.push(column);
        valueStr.push('?');
        valueArr.push(value);
        setStr.push(`${column}=?`);
    }

    if (updateData) {
        const nowCacheRecord = nowCache[data[primaryColumn]];
        for (const [column, value] of Object.entries(data)) {
            nowCacheRecord[column] = Util.cloneObj(value);
        }
    } else {
        nowCache[data[primaryColumn]] = Util.cloneObj(data);
    }

    const numValues = valueArr.length;
    for (let i = 0; i < numValues; i++) valueArr.push(valueArr[i]);

    columnStr = columnStr.join(',');
    valueStr = valueStr.join(',');
    setStr = setStr.join(',');

    const queryStr = `INSERT INTO ${tableName}(${columnStr}) VALUES(${valueStr}) ON DUPLICATE KEY UPDATE ${setStr};`;

    return exports.query(queryStr, valueArr);
};

exports.connectInitial = async function (dbGuilds) {
    Util.logc('MySQL', '[MySQL] Initialising connection to database');

    // try {
    await exports.connect();
    Util.logc('MySQL', `[MySQL] Connected as id ${connection.threadId}`);

    await exports.updateCache();
    Util.logc('MySQL', '[MySQL] Set up local cache');

    await exports.initAutoInc();
    Util.logc('MySQL', '[MySQL] Set up local auto-increment');

    for (let i = 0; i < dbGuilds.length; i++) {
        const guild = dbGuilds[i];

        const sqlCmd = [];
        const sanValues = [];

        guild.members.forEach((member) => {
            sqlCmd.push('INSERT IGNORE INTO members (user_id, buyer, nickname) VALUES(?, ?, ?);');
            sanValues.push(member.id, Util.hasRoleName(member, 'buyer'), member.nickname);
        });

        const sqlCmdStr = sqlCmd.join('\n');

        exports.query(sqlCmdStr, sanValues)
            .catch((err) => {
                Util.logc('MySQL', `[MySQL] Queries Failed: ${guild.name} ${err}`);
            });
    }

    Mutes.initialize();

    // connection.end();

    return true;
    /* } catch (err) {
        console.error(`[MySQL] Error connecting: ${err.stack}`);
        return false;
    } */
};

// Deprecated soon

FileSys.readFile(autoRoleDir, 'utf-8', (err, data) => {
    if (err) throw err;

    if (data.length > 0) {
        const tempObj = JSON.parse(data);
        for (const [key] of Object.entries(tempObj)) {
            exports.autoRoles[key] = tempObj[key];
        }
    }

    Object.defineProperty(exports.autoRoles, '__name', {
        value: 'autoRoles',
        enumerable: false,
        writable: false,
    });
    Object.defineProperty(exports.autoRoles, '__path', {
        value: autoRoleDir,
        enumerable: false,
        writable: false,
    });
    exports.loadedData[exports.autoRoles] = true;
});

FileSys.readFile(playlistDir, 'utf-8', (err, data) => {
    if (err) throw err;

    if (data.length > 0) {
        const tempObj = JSON.parse(data);
        for (const [key] of Object.entries(tempObj)) {
            exports.playlist[key] = tempObj[key];
        }
    }

    Object.defineProperty(exports.playlist, '__name', {
        value: 'playlist',
        enumerable: false,
        writable: false,
    });
    Object.defineProperty(exports.playlist, '__path', {
        value: playlistDir,
        enumerable: false,
        writable: false,
    });
    exports.loadedData[exports.playlist] = true;
});

FileSys.readFile(histDir, 'utf-8', (err, data) => {
    if (err) throw err;

    if (data.length > 0) {
        const tempObj = JSON.parse(data);
        for (const [key] of Object.entries(tempObj)) {
            exports.history[key] = tempObj[key];
        }
    }

    Object.defineProperty(exports.history, '__name', {
        value: 'history',
        enumerable: false,
        writable: false,
    });
    Object.defineProperty(exports.history, '__path', {
        value: histDir,
        enumerable: false,
        writable: false,
    });

    exports.loadedData[exports.history] = true;
});

FileSys.readFile(mutesDir, 'utf-8', (err, data) => {
    if (err) throw err;

    if (data.length > 0) {
        const tempObj = JSON.parse(data);
        for (const [key] of Object.entries(tempObj)) {
            exports.muted[key] = tempObj[key];
        }
    }

    Object.defineProperty(exports.muted, '__name', {
        value: 'muted',
        enumerable: false,
        writable: false,
    });
    Object.defineProperty(exports.muted, '__path', {
        value: mutesDir,
        enumerable: false,
        writable: false,
    });
    exports.loadedData[exports.muted] = true;

    Util.log('> Loaded persistent data!');
});
