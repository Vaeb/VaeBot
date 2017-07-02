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
                        console.log(`[CRIT_ERROR_2] Can't resolve linked guild: ${linkedGuildId}`);
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
                console.log(`[CRIT_ERROR] Can't resolve linked guild: ${linkedGuildId}`);
                return null;
            }
            return guild;
        }
    }

    return guild;
};

exports.guildSaveData = function (obj/* , retry */) {
    if (!exports.loadedData[obj]) return;
    const objName = obj.__name;
    const objPath = obj.__path;
    const objStr = JSON.stringify(obj);
    // if (objName === 'muted') console.log(`SavedMutedDebug: ${objStr}`);
    const stream = FileSys.createWriteStream(objPath);
    stream.once('open', () => {
        stream.write(objStr);
        stream.end();
        console.log(`Saved: ${objName}`);
    });
    /* FileSys.writeFile(objPath, objStr, (err) => {
        if (err) {
            console.log(`Error saving ${objName}: ${err}`);
            if (!retry) exports.guildSaveData(obj, true);
        } else {
            console.log(`Saved: ${objName}`);
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

function emptyPromise() {
    return new Promise((resolve) => {
        resolve([]);
    });
}

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
        console.log('[MySQL] Connecting...');
        connection.connect((err) => {
            if (err) return reject(err);
            return resolve();
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
    if (guild.id !== '284746138995785729') return emptyPromise(); // Until multi-guild integration

    let conditionStr = [];
    const valueArr = [];

    for (const [column, valueData] of Object.entries(identity)) {
        let value = valueData;
        let operator = '=';

        if (Util.isObject(valueData)) {
            value = valueData.value;
            operator = valueData.operator || '=';
        }

        conditionStr.push(`${column}${operator}?`);
        // valueArr.push(dataToString(value));
        valueArr.push(value);
    }

    conditionStr = conditionStr.join(' OR ');

    const queryStr = `SELECT * FROM ${tableName} WHERE ${conditionStr};`;
    // console.log(queryStr);

    return exports.query(queryStr, valueArr);
};

exports.deleteRecords = function (guild, tableName, identity) {
    if (guild.id !== '284746138995785729') return emptyPromise(); // Until multi-guild integration

    let conditionStr = [];
    const valueArr = [];

    for (const [column, valueData] of Object.entries(identity)) {
        let value = valueData;
        let operator = '=';

        if (Util.isObject(valueData)) {
            value = valueData.value;
            operator = valueData.operator || '=';
        }

        conditionStr.push(`${column}${operator}?`);
        // valueArr.push(dataToString(value));
        valueArr.push(value);
    }

    conditionStr = conditionStr.join(' OR ');

    const queryStr = `DELETE FROM ${tableName} WHERE ${conditionStr};`;
    console.log(queryStr);

    return exports.query(queryStr, valueArr);
};

exports.updateRecords = function (guild, tableName, identity, data) {
    if (guild.id !== '284746138995785729') return emptyPromise();

    let updateStr = [];
    let conditionStr = [];
    const valueArr = [];

    for (const [column, value] of Object.entries(data)) {
        updateStr.push(`${column}=?`);
        // valueArr.push(dataToString(value));
        valueArr.push(value);
    }

    for (const [column, value] of Object.entries(identity)) {
        conditionStr.push(`${column}=?`);
        // valueArr.push(dataToString(value));
        valueArr.push(value);
    }

    updateStr = updateStr.join(',');
    conditionStr = conditionStr.join(' OR ');

    const queryStr = `UPDATE ${tableName} SET ${updateStr} WHERE ${conditionStr};`;

    return exports.query(queryStr, valueArr);
};

exports.addRecord = function (guild, tableName, data) {
    if (guild.id !== '284746138995785729') return emptyPromise();

    let columnStr = [];
    let valueStr = [];
    const valueArr = [];

    for (const [column, value] of Object.entries(data)) {
        columnStr.push(column);
        valueStr.push('?');
        // valueArr.push(dataToString(value));
        valueArr.push(value);
    }

    columnStr = columnStr.join(',');
    valueStr = valueStr.join(',');

    const queryStr = `INSERT INTO ${tableName}(${columnStr}) VALUES(${valueStr});`;

    return exports.query(queryStr, valueArr);
};

exports.connectInitial = function (dbGuilds) {
    console.log('[MySQL] Initialising connection to database');

    exports.connect()
    .then(() => {
        console.log(`[MySQL] Connected as id ${connection.threadId}`);

        for (let i = 0; i < dbGuilds.length; i++) {
            const guild = dbGuilds[i];
            console.log(`[MySQL] Setting up database for ${guild.name}`);

            const sqlCmd = [];
            const sanValues = [];

            guild.members.forEach((member) => {
                sqlCmd.push('INSERT IGNORE INTO members VALUES(?,NULL);');
                sanValues.push(member.id);
            });

            const sqlCmdStr = sqlCmd.join('\n');

            exports.query(sqlCmdStr, sanValues)
            .then(() => {
                console.log(`[MySQL] Finished: ${guild.name}`);
            })
            .catch(console.error);
        }

        Mutes.initialize();

        // connection.end();
    })
    .catch((err) => {
        console.error(`[MySQL] Error connecting: ${err.stack}`);
    });
};

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

    console.log('Loaded persistent data!');
});
