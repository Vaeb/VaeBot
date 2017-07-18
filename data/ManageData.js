const FileSys = index.FileSys;

const mutesDir = './data/mutes.json';
const histDir = './data/history.json';
const autoRoleDir = './data/autoroles.json';
const playlistDir = './data/playlist.json';

const linkGuilds = index.linkGuilds;

exports.loadedData = [];

exports.autoRoles = {};
exports.playlist = {};
exports.history = {};
exports.muted = {};

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
    });

    exports.connection = connection;

    return new Promise((resolve, reject) => {
        Util.log('[MySQL] Connecting...');
        connection.connect((err) => {
            if (err) return reject(err);
            return resolve();
        });

        connection.on('error', (err) => {
            if (err.fatal) {
                Util.log(`[MySQL] Fatal error: ${err.code}`);
                Util.log('[MySQL] Attempting to reconnect...');
                exports.connect();
            } else {
                Util.log(`Non-fatal error: ${err.code}`);
            }
        });
    });
};

exports.fromBuffer = function (buffer) {
    return buffer.readUIntBE(0, 1);
};

/* function dataToString(value) {
    if (typeof value === 'string') {
        return `'${value}'`;
    }
    return `${value}`;
} */

// SELECT * FROM members WHERE user_id='107593015014486016';

exports.getRecords = function (guild, tableName, identity) {
    const guildId = exports.getBaseGuildId(guild.id);

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

exports.deleteRecords = function (guild, tableName, identity) {
    const guildId = exports.getBaseGuildId(guild.id);

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
    Util.log(queryStr);

    return exports.query(queryStr, valueArr);
};

exports.updateRecords = function (guild, tableName, identity, data) {
    const guildId = exports.getBaseGuildId(guild.id);

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

    Util.log(queryStr);
    Util.log(valueArr);

    return exports.query(queryStr, valueArr);
};

exports.addRecord = function (guild, tableName, data) {
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
};

exports.connectInitial = async function (dbGuilds) {
    Util.log('[MySQL] Initialising connection to database');

    try {
        await exports.connect();
        Util.log(`[MySQL] Connected as id ${connection.threadId}`);

        for (let i = 0; i < dbGuilds.length; i++) {
            const guild = dbGuilds[i];

            const sqlCmd = [];
            const sanValues = [];

            guild.members.forEach((member) => {
                sqlCmd.push('INSERT IGNORE INTO members VALUES(?,NULL);');
                sanValues.push(member.id);
            });

            const sqlCmdStr = sqlCmd.join('\n');

            exports.query(sqlCmdStr, sanValues)
            .catch((err) => {
                Util.log(`[MySQL] Queries Failed: ${guild.name} ${err}`);
            });
        }

        Mutes.initialize();

        // connection.end();

        return true;
    } catch (err) {
        console.error(`[MySQL] Error connecting: ${err.stack}`);
        return false;
    }
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
