/*

addCommand\((\[.+?\]), (\w+?), (\w+?), (\w+?), function\([\w, ]+?\) {.*\n\t([\s\S]+?)\n},\n\t(".*?"),\n\t(".*?"),\n\t(".*?")\n\)

module.exports = Cmds.addCommand({
    cmds: \1,

    requires: {
        guild: \4,
        loud: false
    },

    desc: \6,

    args: \7,

    example: \8,

    func: (cmd, args, msgObj, speaker, channel, guild) => {
    \5
    }
})

*/

const FileSys = index.FileSys;
const DateFormat = index.DateFormat;
const Exec = index.Exec;
const Path = index.Path;

exports.regexURLPerfect = new RegExp(
    '^' +
        // protocol identifier
        '(?:(?:https?|ftp)://)' +
        // user:pass authentication
        '(?:\\S+(?::\\S*)?@)?' +
        '(?:' +
            // IP address exclusion
            // private & local networks
            '(?!(?:10|127)(?:\\.\\d{1,3}){3})' +
            '(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})' +
            '(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})' +
            // IP address dotted notation octets
            // excludes loopback network 0.0.0.0
            // excludes reserved space >= 224.0.0.0
            // excludes network & broacast addresses
            // (first & last IP address of each class)
            '(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])' +
            '(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}' +
            '(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))' +
        '|' +
            // host name
            '(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)' +
            // domain name
            '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*' +
            // TLD identifier
            '(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))' +
            // TLD may end with dot
            '\\.?' +
        ')' +
        // port number
        '(?::\\d{2,5})?' +
        // resource path
        '(?:[/?#]\\S*)?' +
    '$', 'i');

exports.rolePermissions = [
    'CREATE_INSTANT_INVITE',
    'KICK_MEMBERS',
    'BAN_MEMBERS',
    'VIEW_AUDIT_LOG',
    'ADMINISTRATOR',
    'MANAGE_CHANNELS',
    'MANAGE_GUILD',
    'ADD_REACTIONS', // add reactions to messages
    'READ_MESSAGES',
    'SEND_MESSAGES',
    'SEND_TTS_MESSAGES',
    'MANAGE_MESSAGES',
    'EMBED_LINKS',
    'ATTACH_FILES',
    'READ_MESSAGE_HISTORY',
    'MENTION_EVERYONE',
    'USE_EXTERNAL_EMOJIS', // use external emojis
    'CONNECT', // connect to voice
    'SPEAK', // speak on voice
    'MUTE_MEMBERS', // globally mute members on voice
    'DEAFEN_MEMBERS', // globally deafen members on voice
    'MOVE_MEMBERS', // move member's voice channels
    'USE_VAD', // use voice activity detection
    'CHANGE_NICKNAME',
    'MANAGE_NICKNAMES', // change nicknames of others
    'MANAGE_ROLES',
    'MANAGE_WEBHOOKS',
    'MANAGE_EMOJIS',
];

exports.rolePermissionsObj = {
    CREATE_INSTANT_INVITE: true,
    KICK_MEMBERS: true,
    BAN_MEMBERS: true,
    VIEW_AUDIT_LOG: true,
    ADMINISTRATOR: true,
    MANAGE_CHANNELS: true,
    MANAGE_GUILD: true,
    ADD_REACTIONS: true, // add reactions to messages
    READ_MESSAGES: true,
    SEND_MESSAGES: true,
    SEND_TTS_MESSAGES: true,
    MANAGE_MESSAGES: true,
    EMBED_LINKS: true,
    ATTACH_FILES: true,
    READ_MESSAGE_HISTORY: true,
    MENTION_EVERYONE: true,
    USE_EXTERNAL_EMOJIS: true, // use external emojis
    CONNECT: true, // connect to voice
    SPEAK: true, // speak on voice
    MUTE_MEMBERS: true, // globally mute members on voice
    DEAFEN_MEMBERS: true, // globally deafen members on voice
    MOVE_MEMBERS: true, // move member's voice channels
    USE_VAD: true, // use voice activity detection
    CHANGE_NICKNAME: true,
    MANAGE_NICKNAMES: true, // change nicknames of others
    MANAGE_ROLES: true,
    MANAGE_WEBHOOKS: true,
    MANAGE_EMOJIS: true,
};

exports.textChannelPermissions = [
    'CREATE_INSTANT_INVITE',
    'MANAGE_CHANNEL',
    'ADD_REACTIONS', // add reactions to messages
    'READ_MESSAGES',
    'SEND_MESSAGES',
    'SEND_TTS_MESSAGES',
    'MANAGE_MESSAGES',
    'EMBED_LINKS',
    'ATTACH_FILES',
    'READ_MESSAGE_HISTORY',
    'MENTION_EVERYONE',
    'USE_EXTERNAL_EMOJIS', // use external emojis
    'MANAGE_PERMISSIONS',
    'MANAGE_WEBHOOKS',
];

exports.textChannelPermissionsObj = {
    ADD_REACTIONS: true, // add reactions to messages
    READ_MESSAGES: true,
    SEND_MESSAGES: true,
    SEND_TTS_MESSAGES: true,
    MANAGE_MESSAGES: true,
    EMBED_LINKS: true,
    ATTACH_FILES: true,
    READ_MESSAGE_HISTORY: true,
    MENTION_EVERYONE: true,
    USE_EXTERNAL_EMOJIS: true, // use external emojis
    CREATE_INSTANT_INVITE: true,
    MANAGE_CHANNEL: true,
    MANAGE_PERMISSIONS: true,
    MANAGE_WEBHOOKS: true,
};

exports.voiceChannelPermissions = [
    'CONNECT', // connect to voice
    'SPEAK', // speak on voice
    'MUTE_MEMBERS', // globally mute members on voice
    'DEAFEN_MEMBERS', // globally deafen members on voice
    'MOVE_MEMBERS', // move member's voice channels
    'USE_VAD', // use voice activity detection
    'CREATE_INSTANT_INVITE',
    'MANAGE_CHANNEL',
    'MANAGE_PERMISSIONS',
    'MANAGE_WEBHOOKS',
];

exports.voiceChannelPermissionsObj = {
    CONNECT: true, // connect to voice
    SPEAK: true, // speak on voice
    MUTE_MEMBERS: true, // globally mute members on voice
    DEAFEN_MEMBERS: true, // globally deafen members on voice
    MOVE_MEMBERS: true, // move member's voice channels
    USE_VAD: true, // use voice activity detection
    CREATE_INSTANT_INVITE: true,
    MANAGE_CHANNEL: true,
    MANAGE_PERMISSIONS: true,
    MANAGE_WEBHOOKS: true,
};

exports.permissionsOrder = {
    ADMINISTRATOR: 27,
    MANAGE_GUILD: 26,
    MANAGE_ROLES: 25,
    MANAGE_CHANNELS: 24,
    MANAGE_CHANNEL: 24, // Channel
    MANAGE_WEBHOOKS: 23,
    MANAGE_EMOJIS: 22,
    MANAGE_PERMISSIONS: 22, // Channel
    VIEW_AUDIT_LOG: 21,
    MENTION_EVERYONE: 20,
    BAN_MEMBERS: 19,
    KICK_MEMBERS: 18,
    MOVE_MEMBERS: 17,
    DEAFEN_MEMBERS: 16,
    MUTE_MEMBERS: 15,
    MANAGE_MESSAGES: 14,
    MANAGE_NICKNAMES: 13,
    USE_EXTERNAL_EMOJIS: 12,
    ATTACH_FILES: 11,
    SEND_TTS_MESSAGES: 10,
    ADD_REACTIONS: 9,
    EMBED_LINKS: 8,
    CHANGE_NICKNAME: 7,
    USE_VAD: 6,
    SPEAK: 5,
    CONNECT: 4,
    CREATE_INSTANT_INVITE: 3,
    SEND_MESSAGES: 2,
    READ_MESSAGE_HISTORY: 1,
    READ_MESSAGES: 0,
};

exports.permRating = [
    ['ADMINISTRATOR', 100],
    ['MANAGE_GUILD', 90],
    ['MANAGE_ROLES', 80],
    ['MANAGE_CHANNELS', 70],
    ['MANAGE_EMOJIS', 60],
    ['MENTION_EVERYONE', 50],
    ['VIEW_AUDIT_LOG', 50],
    ['BAN_MEMBERS', 40],
    ['KICK_MEMBERS', 30],
    ['MANAGE_MESSAGES', 20],
    ['MANAGE_NICKNAMES', 20],
    ['MOVE_MEMBERS', 20],
    ['ATTACH_FILES', 10],
    ['ADD_REACTIONS', 10],
    ['SEND_MESSAGES', 10],
];

function replaceAll(str, search, replacement) {
    return str.split(search).join(replacement);
}

function getURLChecker() {
    const SCHEME = '[a-z\\d.-]+://';
    const IPV4 = '(?:(?:[0-9]|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])\\.){3}(?:[0-9]|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])';
    const HOSTNAME = "(?:(?:[^\\s!@#$%^&*()_=+[\\]{}\\\\|;:'\",.<>/?]+)\\.)+";
    const TLD = `(?:ac|ad|aero|ae|af|ag|ai|al|am|an|ao|aq|arpa|ar|asia|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|biz|bi|bj|bm|bn|bo|br
    |bs|bt|bv|bw|by|bz|cat|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|coop|com|co|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|edu|ee|eg|er|es|et|eu
    |fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|info|int|in|io|iq
    |ir|is|it|je|jm|jobs|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mil|mk|ml|mm|mn|mobi
    |mo|mp|mq|mr|ms|mt|museum|mu|mv|mw|mx|my|mz|name|na|nc|net|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|place|pl|pm|pn
    |pro|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm
    |tn|to|tp|trade|travel|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wiki|wf|ws|xn--0zwm56d|xn--11b5bs3a9aj6g|xn--80akhbyknj4f
    |xn--9t4b11yi5a|xn--deba0ad|xn--g6w251d|xn--hgbk6aj7f53bba|xn--hlcj6aya9esc7a|xn--jxalpdlp|xn--kgbechtv|xn--zckzah|ye|yt|yu|za|zm|zw)`;

    const HOST_OR_IP = `(?:${HOSTNAME}${TLD}|${IPV4})`;
    const PATH = '(?:[;/][^#?<>\\s]*)?';
    const QUERY_FRAG = '(?:\\?[^#<>\\s]*)?(?:#[^<>\\s]*)?';
    const URI1 = `\\b${SCHEME}[^<>\\s]+`;
    const URI2 = `\\b${HOST_OR_IP}${PATH}${QUERY_FRAG}(?!\\w)`;

    const MAILTO = 'mailto:';
    const EMAIL = `(?:${MAILTO})?[a-z0-9!#$%&'*+/=?^_\`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_\`{|}~-]+)*@${HOST_OR_IP}${QUERY_FRAG}(?!\\w)`;

    const URI_RE = new RegExp(`(?:${URI1}|${URI2}|${EMAIL})`, 'ig');
    const SCHEME_RE = new RegExp(`^${SCHEME}`, 'i');

    const quotes = {
        "'": '`',
        '>': '<',
        ')': '(',
        ']': '[',
        '}': '{',
        '»': '«',
        '›': '‹',
    };

    const defaultOptions = {
        callback(text, href) {
            return href || null;
        },
        punct_regexp: /(?:[!?.,:;'"]|(?:&|&amp;)(?:lt|gt|quot|apos|raquo|laquo|rsaquo|lsaquo);)$/,
    };

    function checkURLs(txtParam, optionsParam) {
        let txt = replaceAll(txtParam, '\\', '');
        txt = replaceAll(txt, '*', '');
        txt = replaceAll(txt, '_', '');

        if (txt.includes('roblox')) console.log(txt);

        const options = optionsParam || {};

        // Temp variables.
        let arr;
        let i;
        let link;
        let href;

            // Output HTML.
        // const html = '';

            // Store text / link parts, in order, for re-combination.
        const parts = [];

            // Used for keeping track of indices in the text.
        let idxPrev;
        let idxLast;
        let idx;
        let linkLast;

            // Used for trimming trailing punctuation and quotes from links.
        let matchesBegin;
        let matchesEnd;
        let quoteBegin;
        let quoteEnd;

        // Initialize options.
        for (i of Object.keys(defaultOptions)) {
            if (options[i] == null) {
                options[i] = defaultOptions[i];
            }
        }

        const inRep = (a) => {
            idxLast -= a.length;
            return '';
        };

        // Find links.
        while (arr = URI_RE.exec(txt)) {
            link = arr[0];
            idxLast = URI_RE.lastIndex;
            idx = idxLast - link.length;

            // Not a link if preceded by certain characters.
            if (/[/:]/.test(txt.charAt(idx - 1))) {
                continue;
            }

            // Trim trailing punctuation.
            do {
                // If no changes are made, we don't want to loop forever!
                linkLast = link;

                quoteEnd = link.substr(-1);
                quoteBegin = quotes[quoteEnd];

                // Ending quote character?
                if (quoteBegin) {
                    matchesBegin = link.match(new RegExp(`\\${quoteBegin}(?!$)`, 'g'));
                    matchesEnd = link.match(new RegExp(`\\${quoteEnd}`, 'g'));

                    // If quotes are unbalanced, remove trailing quote character.
                    if ((matchesBegin ? matchesBegin.length : 0) < (matchesEnd ? matchesEnd.length : 0)) {
                        link = link.substr(0, link.length - 1);
                        idxLast--;
                    }
                }

                // Ending non-quote punctuation character?
                if (options.punct_regexp) {
                    link = link.replace(options.punct_regexp, inRep);
                }
            } while (link.length && link !== linkLast);

            href = link;

            // Add appropriate protocol to naked links.
            if (!SCHEME_RE.test(href)) {
                const origHref = href;
                if (href.indexOf('@') !== -1) {
                    if (!href.indexOf(MAILTO)) {
                        href = '';
                    } else {
                        href = MAILTO;
                    }
                } else if (!href.indexOf('irc.')) {
                    href = 'irc://';
                } else if (!href.indexOf('ftp.')) {
                    href = 'ftp://';
                } else {
                    href = 'http://';
                }
                href += origHref;
            }

            // Push preceding non-link text onto the array.
            if (idxPrev !== idx) {
                parts.push([txt.slice(idxPrev, idx)]);
                idxPrev = idxLast;
            }

            // Push massaged link onto the array
            parts.push([link, href]);
        }

        // Push remaining non-link text onto the array.
        parts.push([txt.substr(idxPrev)]);

        // Process the array items.
        const URLs = [];

        for (i = 0; i < parts.length; i++) {
            const result = options.callback.apply('nooone', parts[i]);
            if (result) {
                URLs.push(result);
            }
        }

        return URLs;
    }

    return checkURLs;
}

exports.checkURLs = getURLChecker();

exports.initRoles = function (sendRole, guild) {
    const members = guild.members;

    members.forEach((member) => {
        if (!exports.hasRole(member, sendRole)) {
            member.addRole(sendRole)
            .then(() => console.log(`Assigned role to ${exports.getName(member)}`))
            .catch(error => console.log(`\n[E_InitRoles] addRole: ${error}`));
        }
    });
};

exports.arrayToObj = function (arr) {
    const obj = {};
    for (let i = 0; i < arr.length; i++) {
        const val = arr[i];
        obj[val] = true;
    }
    return obj;
};

exports.capitalize = function (strParam) {
    let str = strParam;
    str = String(str);
    return str.charAt(0).toUpperCase() + str.slice(1);
};

exports.runLua = function (args, channel) {
    // args = "os=nil;io=nil;debug=nil;package=nil;require=nil;loadfile=nil;dofile=nil;collectgarbage=nil;" + args;
    const tagNum = Math.floor((new Date()).getTime());
    const fileDir = `/tmp/script_${tagNum}.lua`;
    FileSys.writeFile(fileDir, args, (err) => {
        if (err) {
            console.log(`Script creation error: ${err}`);
            Util.print(channel, `Script creation error: ${err}`);
        }
        Exec(`lua ${fileDir}`, (error, stdoutParam, stderr) => {
            let stdout = stdoutParam;
            if (!stdout) stdout = '';
            const safeOut = Util.safe(stdout);
            // var safeErr = Util.safe(stderr);
            const outStr = [];
            if (error) {
                outStr.push('**Execution error:**');
                outStr.push('```');
                console.log(`Execution Error: ${stderr}`);
                outStr.push(error);
                outStr.push('```');
            } else {
                if (safeOut.length <= 1980) {
                    outStr.push('**Output:**');
                    outStr.push('```');
                    outStr.push(safeOut);
                    outStr.push('```');
                } else {
                    const headers = {
                        'Content-Type': 'text/plain',
                    };
                    const options = {
                        url: 'http://hastebin.com/documents',
                        method: 'POST',
                        headers,
                        body: stdout,
                    };
                    index.Request(options, (error2, response, bodyParam) => {
                        const body = JSON.parse(bodyParam);
                        if (error2 || !body || !body.key) {
                            Util.print(channel, 'Hastebin upload error:', error2);
                        } else {
                            Util.print(channel, 'Output:', `http://hastebin.com/raw/${body.key}`);
                        }
                    });
                }
                if (stderr) {
                    outStr.push('**Lua Error:**');
                    outStr.push('```');
                    console.log(`Lua Error: ${stderr}`);
                    outStr.push(stderr);
                    outStr.push('```');
                }
            }
            Util.print(channel, outStr.join('\n'));
            FileSys.unlink(fileDir);
        });
    });
};

exports.doXOR = function (a, b) {
    return ((a === 1 || b === 1) && !(a === 1 && b === 1)) ? 1 : 0;
};

exports.capitalize2 = function (strParam, repUnder) {
    let str = String(strParam);
    if (repUnder) str = replaceAll(str, '_', ' ');
    str = str.replace(/[0-9a-z]+/ig, (txt) => { console.log(txt); return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
    return str;
};

exports.boolToAns = function (bool) {
    return bool ? 'Yes' : 'No';
};

exports.safe = function (str) {
    if (typeof (str) === 'string') return str.replace(/`/g, '\\`').replace(/@/g, '@­');
    return undefined;
};

exports.safe2 = function (str) {
    if (typeof (str) === 'string') return str.replace(/`/g, '\\`');
    return undefined;
};

exports.safeEveryone = function (str) {
    if (typeof (str) === 'string') {
        const newStr = str.replace(/@everyone/g, '@​everyone');
        return newStr.replace(/@here/g, '@​here');
    }
    return undefined;
};

exports.fix = function (str) {
    return (`\`${exports.safe(str)}\``);
};

exports.toFixedCut = function (num, decimals) {
    return Number(num.toFixed(decimals)).toString();
};

exports.grabFiles = (filePath, filter = () => true) => {
    const dirFiles = FileSys.readdirSync(filePath);
    let fullFiles = [];
    dirFiles.forEach((file) => {
        const fileData = FileSys.lstatSync(`${filePath}${file}`);
        if (fileData.isDirectory()) {
            const toAdd = exports.grabFiles(`${filePath}${file}/`, filter);
            fullFiles = fullFiles.concat(toAdd);
        } else if (filter(file)) {
            fullFiles.push(`${filePath}${file}`);
        }
    });
    return fullFiles;
};

exports.bulkRequire = (filePath) => {
    const bulkFiles = exports.grabFiles(filePath, file => file.endsWith('.js'));

    for (const data of Object.values(bulkFiles)) {
        exports.pathRequire(data);
    }
};

exports.pathRequire = (filePath) => {
    const file = Path.resolve(filePath);
    delete require.cache[require.resolve(file)];

    const fileData = require(filePath);

    const dirName = /(\w+)[/\\]\w+\.js$/.exec(file)[1];

    if (dirName && Object.prototype.hasOwnProperty.call(index.commandTypes, dirName)) {
        const cmdTypes = index.commandTypes;
        for (const [commandType, commandKey] of Object.entries(cmdTypes)) {
            if (commandKey !== 'null') {
                if (commandType === dirName) {
                    fileData[2][commandKey] = true;
                } else {
                    fileData[2][commandKey] = false;
                }
            }
        }
    }
};

exports.checkStaff = function (guild, member) {
    if (member.id === vaebId || member.id === selfId || member.id === guild.ownerID) return true;
    const speakerRoles = member.roles;
    if (!speakerRoles) return false;
    if (exports.getPermRating(guild, member) >= 30) return true;
    return speakerRoles.some(role => role.name === 'Staff' || role.name === 'Owner/Seller' || role.name === 'Bot Admin'
        || role.name === 'Moderator' || role.name === 'Head Mod');
};

exports.commandFailed = function (channel, speaker, message) {
    exports.sendEmbed(channel, 'Command Failed', message, exports.makeEmbedFooter(speaker), null, 0x00E676, null);
    return false;
};

exports.getRandomInt = function (minParam, maxParam) { // inclusive, exclusive
    const min = Math.ceil(minParam);
    const max = Math.floor(maxParam);
    return Math.floor(Math.random() * (max - min)) + min;
};

/* function chunkStringLine(str, size) {
    var numChunks = Math.ceil(str.length / size);
    var chunks = [];

    for (var i = 0, o = 0; i < numChunks; ++i, o += size) {
        chunks[i] = str.substr(o, size);
    }

    var chunkLength = chunks.length;

    if (numChunks > 1) {
        for (var i = 0; i < chunkLength; i++) {
            var nowChunk = chunks[i];
            var lastLine = nowChunk.lastIndexOf("\n");
            if (lastLine >= 0) {
                var nowChunkMsg = nowChunk.substring(0, lastLine);
                chunks[i] = nowChunkMsg;
                var nextChunkMsg = nowChunk.substring(lastLine+1);
                if (chunks[i+1] == null) {
                    if (nextChunkMsg == "" || nextChunkMsg == "\n" || nextChunkMsg == "```" || nextChunkMsg == "\n```") break;
                    chunks[i+1] = "";
                }
                chunks[i+1] = nextChunkMsg + chunks[i+1];
            }
        }
    }

    return chunks;
}*/

/*

-Chunk string into sets of 2k chars
-For each chunk
    -If msg includes newline and first character of next message isn't newline
        -Find last newline (unless start of next chunk is newline in which case use the if statement below), where the character before it isn't a codeblock
        -Copy everything after the newline to the start of the next chunk
        -Set msg to everything before the newline
    -If number of code blocks is odd and there are non-whitespace characters after the last codeblock
        -Add a codeblock to the end of the chunk
    -If number of characters is above 2000
        -Find last newline under (or equal) the 2001 character mark, where the character before it isn't a codeblock
        -If no newline
            -Append a newline as <= 2001st character (not between code blocks if possible)
        -Copy everything after the newline (but before the code block), then append it (with an extra newline on the end) to the start of the next chunk
        -Cut the chunk to everything before the newline

*/

exports.isObject = function (val) {
    if (val == null) return false;
    return (typeof (val) === 'object');
};

exports.cloneObj = function (obj) {
    let copy;

    if (obj == null || typeof (obj) !== 'object') return obj;

    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    if (obj instanceof Array) {
        copy = [];
        const len = obj.length;
        for (let i = 0; i < len; i++) {
            copy[i] = exports.cloneObj(obj[i]);
        }
        return copy;
    }

    if (obj instanceof Object) {
        copy = {};

        for (const [attr, objAttr] of Object.entries(obj)) {
            copy[attr] = exports.cloneObj(objAttr);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
};

exports.formatTime = function (time) {
    let timeStr;
    let formatStr;

    const numSeconds = exports.round(time / 1000, 1);
    const numMinutes = exports.round(time / 60000, 0.1);
    const numHours = exports.round(time / 3600000, 0.1);
    const numDays = exports.round(time / 86400000, 0.1);

    if (numSeconds < 60) {
        timeStr = numSeconds.toFixed(0);
        formatStr = `${timeStr} second`;
    } else if (numMinutes < 60) {
        timeStr = numMinutes % 1 === 0 ? numMinutes.toFixed(0) : numMinutes.toFixed(1);
        formatStr = `${timeStr} minute`;
    } else if (numHours < 60) {
        timeStr = numHours % 1 === 0 ? numHours.toFixed(0) : numHours.toFixed(1);
        formatStr = `${timeStr} hour`;
    } else if (numDays < 60) {
        timeStr = numDays % 1 === 0 ? numDays.toFixed(0) : numDays.toFixed(1);
        formatStr = `${timeStr} day`;
    }

    if (timeStr !== '1') formatStr += 's';

    return formatStr;
};

exports.chunkString = function (str, maxChars) {
    const iterations = Math.ceil(str.length / maxChars);
    const chunks = new Array(iterations);
    for (let i = 0, j = 0; i < iterations; ++i, j += maxChars) chunks[i] = str.substr(j, maxChars);
    return chunks;
};

exports.cutStringSafe = function (msg, postMsg, lastIsOpener) { // Tries to cut the string along a newline
    let lastIndex = msg.lastIndexOf('\n');
    if (lastIndex < 0) return [msg, postMsg];
    let preCut = msg.substring(0, lastIndex);
    let postCut = msg.substring(lastIndex + 1);
    const postHasBlock = postCut.includes('```');
    if (postHasBlock && !lastIsOpener) { // If postCut is trying to pass over a code block (not allowed) might as well just cut after the code block (as long as it's a closer)
        lastIndex = msg.lastIndexOf('```');
        preCut = msg.substring(0, lastIndex + 3);
        postCut = msg.substring(lastIndex + 3);
    } else {
        const strEnd1 = preCut.substr(Math.max(preCut.length - 3, 0), 3);
        const strEnd2 = preCut.substr(Math.max(preCut.length - 4, 0), 4);
        if (postHasBlock || (lastIsOpener && (strEnd1 === '```' || strEnd2 === '``` ' || strEnd2 === '```\n'))) { // If post is triyng to pass over opener or last section of preCut is an opener
            return [msg, postMsg];
        }
    }
    return [preCut, postCut + postMsg];
};

exports.fixMessageLengthNew = function (msgParam) {
    const argsFixed = exports.chunkString(msgParam, 2000); // Group string into sets of 2k chars
    // argsFixed.forEach(o => console.log("---\n" + o));
    let totalBlocks = 0; // Total number of *user created* code blocks come across so far (therefore if the number is odd then code block is currently open)
    for (let i = 0; i < argsFixed.length; i++) {
        let passOver = ''; // String to pass over as the start of the next chunk
        let msg = argsFixed[i];
        const numBlock = (msg.match(/```/g) || []).length; // Number of user created code blocks in this chunk
        if (totalBlocks % 2 === 1) msg = `\`\`\`\n${msg}`; // If code block is currently open then this chunk needs to be formatted
        totalBlocks += numBlock; // The user created code blocks may close/open new code block (don't need to include added ones because they just account for seperate messages)
        let lastIsOpener = totalBlocks % 2 === 1; // Checks whether the last code block is an opener or a closer
        if (lastIsOpener && msg.length > 1996) { // If the chunk ends with the code block still open then it needs to be auto-closed so the chunk needs to be shortened so it can fit
            passOver = msg.substring(1996);
            msg = msg.substr(0, 1996);
            const numPass = (passOver.match(/```/g) || []).length; // If we end up passing over code blocks whilst trying to shorten the string, we need to account for the new amount
            totalBlocks -= numPass;
            if (numPass % 2 === 1) lastIsOpener = false;
        }
        const nextMsg = passOver + (argsFixed[i + 1] != null ? argsFixed[i + 1] : ''); // Message for next chunk (or empty string if none)
        if (nextMsg !== '' && nextMsg[0] !== '\n' && msg.includes('\n')) { // If start of next chunk is a newline then can just leave the split as it is now (same goes for this chunk having no newlines)
            const cutData = exports.cutStringSafe(msg, '', lastIsOpener);
            msg = cutData[0];
            passOver = cutData[1] + passOver;
        }
        if (lastIsOpener) msg += '\n```'; // Close any left over code blocks (and re open on next chunk if they continue)
        argsFixed[i] = msg;
        if (passOver.length > 0) { // Whether any text actually needs to be passed
            if (argsFixed[i + 1] == null) argsFixed[i + 1] = ''; // Create new chunk if this is the last one
            argsFixed[i + 1] = passOver + argsFixed[i + 1];
        }
    }
    return argsFixed;
};

/* function fixMessageLength(msg) {
    var argsFixed = chunkStringLine(msg, 2000);
    var argsLength = argsFixed.length;
    for (var i = 0; i < argsFixed.length; i++) {
        var passOver = "";
        var msg = argsFixed[i];
        //console.log("Original message length: " + msg.length);
        if (msg.length > 1996) {
            passOver = msg.substring(1996);
            msg = msg.substring(0, 1996);
            //console.log("passStart orig: " + passOver.length);
            var lastLine = msg.lastIndexOf("\n");
            if (lastLine >= 5) {
                var msgEnd = lastLine;
                var passStart = msgEnd+1;
                passOver = msg.substring(passStart) + passOver;
                msg = msg.substring(0, msgEnd);
                //console.log("passOver: " + passOver.length);
                //console.log("msg: " + msg.length);
                //console.log("lastLine: " + lastLine);
            }
        }
        var numBlock = (msg.match(/```/g) || []).length;
        if (numBlock % 2 == 1) {
            passOver = "```\n" + passOver;
            msg = msg + "\n```";
        }
        argsFixed[i] = msg;
        //console.log("Message length: " + msg.length);
        //console.log("Pass Over: " + passOver.length);
        if (passOver != "" && (argsFixed[i+1] != null || passOver != "```\n")) {
            if (argsFixed[i+1] == null) {
                //console.log("Created new print block extender")
                argsFixed[i+1] = "";
            }
            argsFixed[i+1] = passOver + argsFixed[i+1];
        }
    }

    return argsFixed;
}*/

exports.splitMessages = function (messages) {
    const fixed = exports.fixMessageLengthNew(messages.join(' '));
    return fixed;
};

const ePrint = error => console.log(`\n[E_Print] ${error}`);

exports.print = function (channel, ...args) {
    const messages = exports.splitMessages(args);
    for (let i = 0; i < messages.length; i++) {
        channel.send(messages[i])
        .catch(ePrint);
    }
};

exports.sortPerms = function (permsArr) {
    permsArr.sort((a, b) => exports.permissionsOrder[b] - exports.permissionsOrder[a]);
};

exports.getGuildRoles = function (guild) {
    const roles = [];
    const guildRoles = guild.roles;

    guildRoles.forEach((nowRole) => {
        const rolePos = nowRole.position;
        let index;

        for (index = 0; index < roles.length; index++) {
            if (rolePos > roles[index].position) {
                break;
            }
        }

        roles.splice(index, 0, nowRole);
    });

    return roles;
};

exports.getName = function (member) {
    return member.username || (member.user ? member.user.username : null);
};

exports.getDisplayName = function (member) {
    return member.displayName || member.username;
};

exports.getMostName = function (user) {
    return `${exports.getName(user)}#${user.getProp('discriminator')}`;
};

exports.getFullName = function (user) {
    return user != null ? (`${exports.getMostName(user)} (${user.id})`) : 'null';
};

exports.getMention = function (obj) {
    return obj.toString();
};

exports.getAvatar = function (user, outStr) {
    if (user != null && exports.isObject(user)) {
        return (user.avatarURL || (user.user ? user.user.avatarURL : null));
    }
    return (outStr === true ? 'null' : null);
};

exports.getDateString = function (d) {
    return `${DateFormat(d, 'ddd, mmm dS yyyy @ h:MM TT')} GMT`;
};

exports.hasRole = function (member, role) {
    return member.roles.has(role.id);
};

exports.makeEmbedFooter = function (user, dateParam) {
    const memberName = exports.isObject(user) ? exports.getDisplayName(user) : String(user);
    let date = dateParam;
    if (date == null) date = new Date();
    const dateStr = exports.getDateString(date);
    return { text: `${memberName} | ${dateStr}`, icon_url: exports.getAvatar(user) };
};

/*

    If nowString is less than or exactly 512 characters set as field value and return nowFieldNum
    Find last newline under 512 characters
    If none exists then trim, set and return nowFieldNum
    Set everything before newline as value for the field
    Create new field immediately after current field
    Set name as zero width character
    Return function on new field and string after newline

*/

exports.setFieldValue = function (embFields, nowFieldNum, nowString) {
    const nowField = embFields[nowFieldNum];
    if (nowString.length <= 512) {
        nowField.value = nowString;
        return nowFieldNum;
    }
    let subFirst = nowString.substr(0, 512);
    let subNext;
    const lastNewline = subFirst.lastIndexOf('\n');
    if (lastNewline < 0) {
        const lastSpace = subFirst.lastIndexOf(' ');
        if (lastSpace < 0) {
            subNext = nowString.substring(512);
        } else {
            subFirst = nowString.substring(0, lastSpace);
            subNext = nowString.substring(lastSpace + 1);
        }
    } else {
        subFirst = nowString.substring(0, lastNewline);
        subNext = nowString.substring(lastNewline + 1);
    }
    nowField.value = subFirst;
    const newFieldNum = nowFieldNum + 1;
    embFields.splice(newFieldNum, 0, { name: '​', value: '', inline: nowField.inline });
    return exports.setFieldValue(embFields, newFieldNum, subNext);
};

/*

Max characters:

Title: 256
Description: 2048
Footer: 2048
Field Name: 256
Field Value: 512 (maybe 1024?)

*/

exports.sendEmbed = function (embChannel, embTitle, embDesc, embFooterParam, embImage, embColor, embFieldsParam, isContinued) {
    if (embChannel == null) return;

    let embFooter = embFooterParam;
    let embFields = embFieldsParam;

    let manyFields = false;
    let extraFields;

    if (embFields == null) embFields = [];

    if (embFields.length > 25) {
        manyFields = true;
        extraFields = embFields.splice(25);
    }

    for (let i = 0; i < embFields.length; i++) {
        const nowField = embFields[i];

        if (!Object.prototype.hasOwnProperty.call(nowField, 'inline')) nowField.inline = true;

        let nowName = nowField.name;
        let nowValue = nowField.value;

        nowName = exports.safeEveryone(String(nowName == null ? 'N/A' : nowName));
        nowValue = exports.safeEveryone(String(nowValue == null ? 'N/A' : nowValue));

        nowField.name = nowName.trim().length < 1 ? 'N/A' : nowName.substr(0, 256);

        if (nowValue.trim().length < 1) {
            nowField.value = 'N/A';
        } else if (nowValue.length > 512) {
            i = exports.setFieldValue(embFields, i, nowValue);
        } else {
            nowField.value = nowValue;
        }
    }

    const embDescStr = String(embDesc);

    let newTitle;
    let newFooter;
    let newDesc = ((embDesc == null || embDescStr.trim().length < 1) ? '​' : embDescStr.substr(0, 2048));

    if (embTitle) newTitle = embTitle.substr(0, 256);
    if (embFooter) {
        if (!exports.isObject(embFooter)) {
            embFooter = { text: embFooter };
        }
        newFooter = exports.cloneObj(embFooter);
        newFooter.text = (newFooter.text).substr(0, 2048);
    }

    if (isContinued) {
        newTitle = null;
        if (newDesc.length < 1 || newDesc === '​') newDesc = null;
    }

    if (manyFields) {
        newFooter = null;
    }

    const embObj = {
        title: newTitle,
        description: newDesc,
        fields: embFields,
        footer: newFooter,
        thumbnail: { url: embImage },
        color: embColor,
    };

    embChannel.send(undefined, { embed: embObj })
    .catch((error) => {
        console.log(`\n[E_SendEmbed] ${error} ${embChannel}`);
        console.log(embObj);
        console.log(JSON.stringify(embFields));
    });

    if (manyFields) {
        exports.sendEmbed(embChannel, embTitle, embDesc, embFooter, embImage, embColor, extraFields, true);
    }
};

exports.sendDescEmbed = function (embChannel, embTitle, embDesc, embFooter, embImage, embColorParam) {
    if (embChannel == null) return;

    let embColor = embColorParam;

    if (embColor == null) embColor = 0x00BCD4;

    if (embDesc != null && embDesc.length > 2048) {
        let subFirst = embDesc.substr(0, 2048);
        let subNext;
        const lastNewline = subFirst.lastIndexOf('\n');
        if (lastNewline < 0) {
            const lastSpace = subFirst.lastIndexOf(' ');
            if (lastSpace < 0) {
                subNext = embDesc.substring(2048);
            } else {
                subFirst = embDesc.substring(0, lastSpace);
                subNext = embDesc.substring(lastSpace + 1);
            }
        } else {
            subFirst = embDesc.substring(0, lastNewline);
            subNext = embDesc.substring(lastNewline + 1);
        }
        exports.sendEmbed(embChannel, embTitle, subFirst, null, embImage, embColor, []);
        exports.sendDescEmbed(embChannel, null, subNext, embFooter, embImage, embColor);
    } else {
        exports.sendEmbed(embChannel, embTitle, embDesc, embFooter, embImage, embColor, []);
    }
};

exports.sendLog = function (embData, embColor) {
    const embTitle = embData[0];
    const embGuild = embData[1];
    const embAuthor = embData[2];
    const embFields = embData.splice(3);

    const embChannel = exports.findChannel('vaebot-log', embGuild);
    if (embChannel == null) return;

    const embFooter = exports.makeEmbedFooter(embAuthor);
    const embAvatar = exports.getAvatar(embAuthor);

    exports.sendEmbed(
        embChannel,
        embTitle,
        null,
        embFooter,
        embAvatar,
        embColor,
        embFields);
};

exports.getHourStr = function (d) {
    let valStr = (d.getHours()).toString();
    if (valStr.length < 2) valStr = `0${valStr}`;
    return valStr;
};

exports.getMinStr = function (d) {
    let valStr = (d.getMinutes()).toString();
    if (valStr.length < 2) valStr = `0${valStr}`;
    return valStr;
};

exports.getYearStr = function (d) {
    const valStr = (d.getFullYear()).toString();
    return valStr;
};

exports.getMonthStr = function (d) {
    let valStr = (d.getMonth() + 1).toString();
    if (valStr.length < 2) valStr = `0${valStr}`;
    return valStr;
};

exports.getDayStr = function (d) {
    let valStr = (d.getDate()).toString();
    if (valStr.length < 2) valStr = `0${valStr}`;
    return valStr;
};

/* function searchPartial(array, name, checkPartial) {
    if (checkPartial != false) {
        var firstChar = name.substr(0, 1);
        var endChar = name.substr(name.length-1, 1);
        if (firstChar == "\"" && endChar == "\"") {
            checkPartial = false;
            name = name.substring(1, name.length-1);
            if (name.length < 1) return;
        }
    }
    name = name.toLowerCase()
    var user = array.find(function(item) {
        var user = exports.getName(item);
        if (checkPartial != false ? exports.safe(user.toLowerCase()).includes(name) : exports.safe(user.toLowerCase()) == name) {
            return true;
        }
        return false;
    })
    return user;
}*/

exports.searchUserPartial = function (col, nameParam) {
    let name = nameParam;

    name = name.toLowerCase();
    return col.find((member) => {
        const userName = exports.getName(member);
        if (member.id === name || exports.safe(userName.toLowerCase()).includes(name)) {
            return true;
        }
        return false;
    });
};

exports.round = function (num, inc) {
    return (inc === 0 ? num : Math.floor((num / inc) + 0.5) * inc);
};

exports.write = function (content, name) {
    FileSys.writeFile(name, content);
};

exports.remove = function (name) {
    FileSys.unlink(name);
};

exports.getHistory = function (id, guild) {
    const userHistory = Data.guildGet(guild, Data.history, id);
    if (userHistory) return userHistory[0];
    return 0;
};

exports.historyToString = function (num) {
    let timeHours = exports.round(num / 3600000, 0.1);
    timeHours = (timeHours >= 1 || timeHours === 0) ? timeHours.toFixed(0) : timeHours.toFixed(1);
    return timeHours + (timeHours === 1 ? ' hour' : ' hours');
};

exports.getSafeId = function (idParam) {
    let id = idParam;
    id = id.match(/\d+/);

    if (id == null) return undefined;

    return id[0];
};

exports.getMemberById = function (idParam, guild) {
    let id = idParam;

    if (guild == null || id == null) return undefined;

    if (id.substr(0, 1) === '<' && id.substr(id.length - 1, 1) === '>') id = exports.getSafeId(id);

    if (id == null || id.length < 1) return undefined;

    return guild.members.find(member => member.id === id);
};

exports.getMatchStrength = function (fullStr, subStr) { // [v2.0]
    let value = 0;

    const fullStrLower = fullStr.toLowerCase();
    const subStrLower = subStr.toLowerCase();

    const nameMatch = fullStrLower.indexOf(subStrLower);

    if (nameMatch >= 0) {
        const filled = Math.min(subStr.length / fullStr.length, 0.999);
        value += 2 ** (2 + filled);

        const maxCaps = Math.min(subStr.length, fullStr.length);
        let numCaps = 0;
        for (let j = 0; j < maxCaps; j++) {
            if (subStr[j] === fullStr[nameMatch + j]) numCaps++;
        }
        const caps = Math.min(numCaps / maxCaps, 0.999);
        value += 2 ** (1 + caps);

        const totalPosition = fullStr.length - subStr.length;
        const perc = 1 - (totalPosition * nameMatch === 0 ? 0.001 : nameMatch / totalPosition);
        value += 2 ** perc;
    }

    return value;
};

exports.getMemberByName = function (name, guild) { // [v2.0] Visible name match, real name match, caps match, length match, position match
    if (guild == null) return undefined;

    const str2Lower = name.toLowerCase();

    const members = guild.members;
    const matchStrength = [];
    let strongest = [0, undefined];

    members.forEach((member) => {
        let value = 0;

        let realName = member.nickname != null ? member.nickname : exports.getName(member);
        let realstr2Lower = realName.toLowerCase();
        let nameMatch = realstr2Lower.indexOf(str2Lower);

        if (nameMatch >= 0) {
            value += 2 ** 4;
        } else {
            realName = exports.getName(member);
            realstr2Lower = realName.toLowerCase();
            nameMatch = realstr2Lower.indexOf(str2Lower);
            if (nameMatch >= 0) {
                value += 2 ** (3);
            }
        }

        if (nameMatch >= 0) {
            // console.log("\n(" + i + ") " + realName + ": " + value);
            const filled = Math.min(name.length / realName.length, 0.999);
            // console.log("filled: " + filled);
            value += 2 ** (2 + filled);

            const maxCaps = Math.min(name.length, realName.length);
            let numCaps = 0;
            for (let j = 0; j < maxCaps; j++) {
                if (name[j] === realName[nameMatch + j]) numCaps++;
            }
            const caps = Math.min(numCaps / maxCaps, 0.999);
            // console.log("caps: " + caps + " (" + numCaps + "/" + maxCaps + ")");
            value += 2 ** (1 + caps);

            const totalPosition = realName.length - name.length;
            const perc = 1 - (totalPosition * nameMatch === 0 ? 0.001 : nameMatch / totalPosition);
            // console.log("pos: " + perc + " (" + nameMatch + "/" + totalPosition + ")");
            value += 2 ** perc;

            // console.log(value);
            matchStrength.push([value, member]);
        }
    });

    for (let i = 0; i < matchStrength.length; i++) {
        const strength = matchStrength[i];
        if (strength[0] > strongest[0]) strongest = strength;
    }

    return strongest[1];
};

exports.getDataFromString = function (str, funcs, returnExtra) {
    const mix = str.split(' ');
    const baseStart = mix.length - 1;
    let start = baseStart;
    let end = 0;
    let pos = start;
    let index = 0;
    let combine = [];
    const results = [];
    while (start >= 0) {
        const remainingFuncs = funcs.length - index - 1;
        const remainingTerms = baseStart - (start);
        if (remainingTerms < remainingFuncs) {
            start--;
            pos = start;
            combine = [];
            continue;
        }
        const chunk = mix[pos];
        if (chunk != null) combine.unshift(chunk);
        if (pos <= end) {
            const result = funcs[index](combine.join(' '), results);
            if (result != null) {
                /* if (index == 1) {
                    console.log("[Z] " + combine.join(" "));
                    console.log("[Z] " + remainingFuncs);
                    console.log("[Z] " + remainingTerms);
                    console.log("[Z] " + pos);
                    console.log("[Z] " + start);
                    console.log("[Z] " + end);
                    console.log("[Z] " + result);
                }*/
                results.push(result);
                index++;
                if (index >= funcs.length) {
                    if (returnExtra) {
                        combine = [];
                        for (let i = start + 1; i < mix.length; i++) {
                            const extra = mix[i];
                            if (extra != null) combine.push(extra);
                        }
                        let leftOver = '';
                        if (combine.length > 0) leftOver = combine.join(' ');
                        results.push(leftOver);
                    }
                    return results;
                }
                end = start + 1;
                if (end > baseStart) return undefined;
                start = baseStart;
            } else {
                start--;
            }
            pos = start;
            combine = [];
        } else {
            pos--;
        }
    }

    return undefined;
};

exports.clamp = function (num, minParam, maxParam) {
    let min = minParam;
    let max = maxParam;
    if (min == null) min = num;
    if (max == null) max = num;
    return Math.min(Math.max(num, min), max);
};

exports.toBoolean = function (str) {
    return (typeof (str) === 'boolean' ? str : (str === 'true' || (str === 'false' ? false : undefined)));
};

exports.getNum = function (str, min, max) {
    const num = Number(str);
    if (isNaN(num)) return undefined;
    return exports.clamp(num, min, max);
};

exports.getInt = function (str, min, max) {
    const num = parseInt(str, 10);
    if (isNaN(num)) return undefined;
    return exports.clamp(num, min, max);
};

exports.isTextChannel = function (channel) {
    return channel.type === 'text';
};

exports.isVoiceChannel = function (channel) {
    return channel.type === 'voice';
};

exports.getTextChannels = function (guild) {
    return guild.channels.filter(exports.isTextChannel);
};

exports.getVoiceChannels = function (guild) {
    return guild.channels.filter(exports.isVoiceChannel);
};

exports.findChannel = function (nameParam, guild) {
    if (guild == null) return undefined;

    let name = nameParam;

    name = name.toLowerCase();
    const channels = exports.getTextChannels(guild);
    return channels.find(nowChannel => nowChannel.id === name || nowChannel.name.toLowerCase() === name);
};

exports.findVoiceChannel = function (nameParam, guild) {
    if (guild == null) return undefined;

    let name = nameParam;

    name = name.toLowerCase();
    const channels = exports.getVoiceChannels(guild);
    return channels.find(nowChannel => nowChannel.id === name || nowChannel.name.toLowerCase() === name);
};

exports.getRole = function (nameParam, obj) {
    if (obj == null) return undefined;

    let name = nameParam;

    name = name.toLowerCase();
    const nameId = exports.getSafeId(name);
    const roles = obj.roles;
    return roles.find(role => (role.name.toLowerCase().includes(name) || role.id === nameId));
};

exports.getHighestRole = function (member) {
    return member.highestRole;
};

exports.getPosition = function (speaker) {
    if (speaker == null || !exports.isObject(speaker)) return undefined;

    if (speaker.id === speaker.guild.ownerID) return 999999999;

    return speaker.highestRole.position;
};

exports.getUserById = function (id) {
    return client.users.get(id);
};

exports.getUserByName = function (name) {
    return exports.searchUserPartial(client.users, name);
};

exports.getUserByMixed = function (name) {
    let user = exports.getUserById(name);
    if (user == null) user = exports.getUserByName(name);
    return user;
};

exports.getMemberByMixed = function (name, guild) {
    if (guild == null) return undefined;
    let targetMember = exports.getMemberById(name, guild);
    if (targetMember == null) targetMember = exports.getMemberByName(name, guild);
    return targetMember;
};

exports.getMemberOrRoleByMixed = function (name, guild) {
    if (guild == null) return undefined;
    let targetObj = exports.getRole(name, guild);
    if (targetObj == null) targetObj = exports.getMemberById(name, guild);
    if (targetObj == null) targetObj = exports.getMemberByName(name, guild);
    return targetObj;
};

exports.getEitherByMixed = function (name, guild) {
    let user = exports.getMemberByMixed(name, guild);
    if (user == null) user = exports.getUserByMixed(name);
    return user;
};

exports.permEnabled = function (iPerms, permName) {
    const allowGeneral = iPerms.General;
    const allowText = iPerms.Text;
    const allowVoice = iPerms.Voice;

    if (Object.prototype.hasOwnProperty.call(allowGeneral, permName)) return allowGeneral[permName];
    if (Object.prototype.hasOwnProperty.call(allowText, permName)) return allowText[permName];
    if (Object.prototype.hasOwnProperty.call(allowVoice, permName)) return allowVoice[permName];

    return undefined;
};

exports.getPermRating = function (guild, userOrRole) {
    if (userOrRole.hasPermission == null) return 0;

    const tempPermRating = exports.cloneObj(exports.permRating);

    let total = 0;
    let foundTop = false;

    for (let i = 0; i < tempPermRating.length; i++) {
        const permData = tempPermRating[i];
        if (userOrRole.hasPermission(permData[0], false)) {
            if (!foundTop) {
                foundTop = true;

                let lastVal = null;
                let pointer0 = i + 1;
                let pointer1 = i + 1;
                let newVal = 5;

                // console.log("found", permData[0]);

                for (let i2 = i + 1; i2 < tempPermRating.length; i2++) {
                    const nowVal = tempPermRating[i2][1];
                    if (lastVal == null) lastVal = nowVal;
                    if (nowVal !== lastVal) {
                        const numPoints = (pointer1 - pointer0) + 1;
                        newVal /= numPoints;
                        for (let n = pointer0; n <= pointer1; n++) {
                            tempPermRating[n][1] = newVal;
                        }
                        newVal /= 2;
                        pointer0 = i2;
                    }
                    pointer1 = i2;
                    lastVal = nowVal;
                }

                const numPoints = (pointer1 - pointer0) + 1;
                newVal /= numPoints;
                for (let n = pointer0; n <= pointer1; n++) {
                    tempPermRating[n][1] = newVal;
                }

                // console.log(tempPermRating);
            }
            total += permData[1];
        }
    }

    total = Math.min(total, 100);

    return total;
};

exports.getMemberPowers = function (guild) {
    const sorted = [];
    const members = guild.members;
    for (let i = 0; i < members.size; i++) {
        const member = members[i];
        const power = exports.getPermRating(guild, member);
        let index = 0;
        for (index = 0; index < sorted.length; index++) {
            if (power >= sorted[index][1]) break;
        }
        sorted.splice(index, 0, [member, power]);
    }
    return sorted;
};

exports.strToPerm = function (strParam) {
    let str = strParam;

    str = replaceAll(str.toUpperCase(), ' ', '_');

    let matchPerm = null;
    let matchTop = 0;

    for (const [permName] of Object.entries(exports.permissionsOrder)) {
        const matchScore = exports.getMatchStrength(permName, str);

        if (matchScore > matchTop) {
            matchTop = matchScore;
            matchPerm = permName;
        }
    }

    return matchPerm;
};

exports.setChannelPerms = function (channel, userOrRole, newPerms) {
    channel.overwritePermissions(userOrRole, newPerms)
    .catch(error => console.log(`\n[E_SetChannelPerms] ${error}`));
};

// fetch more messages just like Discord client does
exports.fetchMessagesEx = function (channel, left, store, lastParam) {
    // message cache is sorted on insertion
    // channel.messages[0] will get oldest message
    let last = lastParam;

    if (last) last = last.id;
    return channel.fetchMessages({ limit: Math.min(left, 100), before: last })
        .then(messages => exports.onFetch(messages, channel, left, store));
};

exports.onFetch = function (messagesParam, channel, leftParam, store) {
    let messages = messagesParam;
    let left = leftParam;

    messages = messages.array();

    if (!messages.length) return Promise.resolve();

    for (let i = 0; i < messages.length; i++) {
        store.push(messages[i]);
    }

    left -= messages.length;

    console.log(`Received ${messages.length}, left: ${left}`);

    if (left <= 0) return Promise.resolve();

    return exports.fetchMessagesEx(channel, left, store, messages[messages.length - 1]);
};

exports.updateMessageCache = function (channel, speaker) {
    exports.fetchMessagesEx(channel, 100, [], channel.messages[0]).then(() => {
        if (speaker) {
            exports.sendDescEmbed(channel, 'Message Cache', 'Refreshed', exports.makeEmbedFooter(speaker), null, 0x00E676);
        }
    });
};
