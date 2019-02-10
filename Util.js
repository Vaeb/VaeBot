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
const NodeUtil = index.NodeUtil;

exports.charLimit = 1999;

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
    'VIEW_CHANNEL',
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
    VIEW_CHANNEL: true,
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
    'VIEW_CHANNEL',
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
    VIEW_CHANNEL: true,
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
    VIEW_CHANNEL: 0,
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

exports.replaceAll = (str, search, replacement) => str.split(search).join(replacement);

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
        let txt = exports.replaceAll(txtParam, '\\', '');
        txt = exports.replaceAll(txt, '*', '');
        txt = exports.replaceAll(txt, '_', '');

        if (txt.includes('roblox')) Util.log(txt);

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
                if (href.indexOf('@') != -1) {
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

function forceAddRolesInner(guild, sendRole, iterNum = 1) {
    let didError = false;

    guild.members.forEach((member) => {
        if (!exports.hasRole(member, sendRole)) {
            member.addRole(sendRole)
                .then(() => Util.log(`Assigned role to ${exports.getName(member)}`))
                .catch((error) => {
                    didError = true;
                    Util.log(`[E_InitRoles] addRole: ${error}`);
                });
        }
    });

    if (!didError || iterNum >= 10) return;

    setTimeout(() => {
        forceAddRolesInner(guild, sendRole, iterNum + 1);
    }, 1000 * 4);
}

function forceAddRoles(guild, sendRole) {
    forceAddRolesInner(guild, sendRole);
}

exports.initRoles = async function (sendRole, guild, guildChannel) {
    try {
        await Promise.all(guild.roles.map(async (role) => {
            if (role.name !== 'SendMessages' && role.hasPermission('SEND_MESSAGES', null, false)) {
                try {
                    await role.setPermissions(role.permissions & (~2048));
                } catch (err) {
                    console.log('[RolePermRem]', err);
                }
            }
        }));

        await Promise.all(guild.channels.map(async (channel) => {
            const deniesMessages = channel.permissionOverwrites.some(channelPerm => channelPerm.type === 'role' && channelPerm.denied.toArray(false).includes('SEND_MESSAGES'));

            if (deniesMessages) return;

            const newOverwrites = channel.permissionOverwrites.map((channelPerm) => {
                // const permObj = channelPerm.type === 'role' ? guild.roles.get(channelPerm.id) : guild.members.get(channelPerm.id);

                const allowed = channelPerm.allowed.toArray(false).filter(perm => perm !== 'SEND_MESSAGES');
                const denied = channelPerm.denied.toArray(false).filter(perm => perm !== 'SEND_MESSAGES');

                return {
                    allowed,
                    denied,
                    id: channelPerm.id,
                    type: channelPerm.type,
                };
            });

            channel.replacePermissionOverwrites({ overwrites: newOverwrites }).catch((err) => {
                console.log('[RepPermOverwrites]', err);
            });
        }));

        if (guildChannel) {
            Util.sendDescEmbed(guildChannel, 'Setup VaeBot', 'Server roles and channels have been setup appropriately', null, null, null);
        }
    } catch (err) {
        console.log('InitRolesInner Error:', err);
    }

    forceAddRoles(guild, sendRole);
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
            Util.log(`Script creation error: ${err}`);
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
                Util.log(`Execution Error: ${stderr}`);
                outStr.push(error);
                outStr.push('```');
            } else {
                if (safeOut.length <= 1980) {
                    outStr.push('**Output:**');
                    outStr.push('```');
                    outStr.push(safeOut);
                    outStr.push('```');
                } else {
                    const options = {
                        url: 'https://hastebin.com/documents',
                        method: 'POST',
                        headers: { 'Content-Type': 'text/plain' },
                        body: stdout,
                    };
                    index.Request(options, (error2, response, bodyParam) => {
                        const body = JSON.parse(bodyParam);
                        if (error2 || !body || !body.key) {
                            Util.print(channel, 'Hastebin upload error:', error2);
                        } else {
                            Util.print(channel, 'Output:', `https://hastebin.com/raw/${body.key}`);
                        }
                    });
                }
                if (stderr) {
                    outStr.push('**Lua Error:**');
                    outStr.push('```');
                    Util.log(`Lua Error: ${stderr}`);
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
    const result = ((a == 1 || b == 1) && !(a == 1 && b == 1)) ? 1 : 0;
    return result;
};

exports.capitalize2 = function (strParam, repUnder) {
    let str = String(strParam);
    if (repUnder) str = exports.replaceAll(str, '_', ' ');
    str = str.replace(/[0-9a-z]+/ig, (txt) => { Util.log(txt); return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
    return str;
};

exports.boolToAns = function (bool) {
    const result = bool ? 'Yes' : 'No';
    return result;
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

exports.fix = str => (`\`${exports.safe(str)}\``);

exports.toFixedCut = (num, decimals) => Number(num.toFixed(decimals)).toString();

exports.grabFiles = function (filePath, filter = () => true) {
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

exports.bulkRequire = function (filePath) {
    const bulkFiles = exports.grabFiles(filePath, file => file.endsWith('.js'));

    for (const data of Object.values(bulkFiles)) {
        exports.pathRequire(data);
    }
};

exports.pathRequire = function (filePath) {
    const file = Path.resolve(filePath);
    delete require.cache[require.resolve(file)];

    const fileData = require(filePath);

    const dirName = /(\w+)[/\\]\w+\.js$/.exec(file)[1];

    if (dirName && has.call(index.commandTypes, dirName)) {
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
    if (guild == null || member == null) {
        Util.log(`>>> CHECK STAFF ISSUE: ${guild} ${member} <<<`);
    }

    if (member.id === vaebId || member.id === selfId || member.id === guild.ownerID) return true;
    const speakerRoles = member.roles;
    if (!speakerRoles) return false;
    // if (exports.getPermRating(guild, member) >= 30) return true;
    return speakerRoles.some(role => /\bstaff\b/i.test(role.name) || role.name === 'Owner/Seller' || role.name === 'Bot Admin'
        || role.name === 'Moderator' || role.name.includes('Head Mod') || role.name === 'Trial Moderator' || /OP$/.test(role.name));
};

exports.commandFailed = function (channel, speaker, tag, message) {
    if (message == null) {
        message = tag;
        tag = null;
    }

    const tagMessage = tag ? `[${tag}] ` : '';

    if (channel != null) {
        exports.sendEmbed(channel, `${tagMessage}Command Failed`, message, exports.makeEmbedFooter(speaker), null, colGreen, null);
    } else {
        Util.log(`${tagMessage}[Command_Failed] ${speaker.id}: ${message}`);
    }

    return false;
};

exports.getRandomInt = function (minParam, maxParam) { // inclusive, exclusive
    maxParam++; // inclusive, inclusive
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
} */

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

exports.isObject = function (val) { // Or array
    if (val == null) return false;
    return (typeof (val) === 'object');
};

exports.cloneObj = function (obj, fixBuffer) {
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
            copy[i] = exports.cloneObj(obj[i], fixBuffer);
        }
        return copy;
    }

    if (fixBuffer && obj instanceof Buffer) {
        return obj.readUIntBE(0, 1);
    }

    if (obj instanceof Object && !(obj instanceof Buffer)) {
        copy = {};
        for (const [attr, objAttr] of Object.entries(obj)) {
            copy[attr] = exports.cloneObj(objAttr, fixBuffer);
        }
        return copy;
    }

    console.log("Couldn't clone obj, returning real value");

    return obj;
};

exports.cloneObjDepth = function (obj, maxDepth = 1, nowDepth = 0) {
    let copy;

    if (obj == null || typeof (obj) !== 'object') return obj;

    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    if (obj instanceof Array) {
        const len = obj.length;

        if (nowDepth >= maxDepth && len > 0) return '[Array]';

        copy = [];
        for (let i = 0; i < len; i++) {
            copy[i] = exports.cloneObjDepth(obj[i], maxDepth, nowDepth + 1);
        }

        return copy;
    }

    if (obj instanceof Object && !(obj instanceof Buffer)) {
        const entries = Object.entries(obj);

        if (nowDepth >= maxDepth && entries.length > 0) return '[Object]';

        copy = {};
        for (const [attr, objAttr] of entries) {
            copy[attr] = exports.cloneObjDepth(objAttr, maxDepth, nowDepth + 1);
        }

        return copy;
    }

    console.log("Couldn't clone obj, returning real value");

    return obj;
};

const elapseTimeTags = {};

exports.throwErr = function () {
    setTimeout(() => {
        throw new Error('err');
    }, 1000);
};

exports.getElapsed = function (tag, remove) {
    let elapsed;

    if (elapseTimeTags[tag] != null) {
        const startTimeData = elapseTimeTags[tag];
        const elapsedTimeData = process.hrtime(startTimeData); // Seconds, Nanoseconds (Seconds * 1e9)
        elapsed = (elapsedTimeData[0] * 1e3) + Number((elapsedTimeData[1] / 1e6).toFixed(3));
    }

    if (remove) {
        elapseTimeTags[tag] = null;
        delete elapseTimeTags[tag]; // Remove time storage
    } else {
        elapseTimeTags[tag] = process.hrtime(); // Mark the start time
    }

    return elapsed;
};

exports.formatTime = function (time) {
    let timeStr;
    let formatStr;

    const numSeconds = exports.round(time / 1000, 0.1);
    const numMinutes = exports.round(time / (1000 * 60), 0.1);
    const numHours = exports.round(time / (1000 * 60 * 60), 0.1);
    const numDays = exports.round(time / (1000 * 60 * 60 * 24), 0.1);
    const numWeeks = exports.round(time / (1000 * 60 * 60 * 24 * 7), 0.1);
    const numMonths = exports.round(time / (1000 * 60 * 60 * 24 * 30.42), 0.1);
    const numYears = exports.round(time / (1000 * 60 * 60 * 24 * 365.2422), 0.1);

    if (numSeconds < 1) {
        timeStr = exports.toFixedCut(time, 0);
        formatStr = `${timeStr} millisecond`;
    } else if (numMinutes < 1) {
        timeStr = exports.toFixedCut(numSeconds, 1);
        formatStr = `${timeStr} second`;
    } else if (numHours < 1) {
        timeStr = exports.toFixedCut(numMinutes, 1);
        formatStr = `${timeStr} minute`;
    } else if (numDays < 1) {
        timeStr = exports.toFixedCut(numHours, 1);
        formatStr = `${timeStr} hour`;
    } else if (numWeeks < 1) {
        timeStr = exports.toFixedCut(numDays, 1);
        formatStr = `${timeStr} day`;
    } else if (numMonths < 1) {
        timeStr = exports.toFixedCut(numWeeks, 1);
        formatStr = `${timeStr} week`;
    } else if (numYears < 1) {
        timeStr = exports.toFixedCut(numMonths, 1);
        formatStr = `${timeStr} month`;
    } else {
        timeStr = exports.toFixedCut(numYears, 1);
        formatStr = `${timeStr} year`;
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
    const argsFixed = exports.chunkString(msgParam, exports.charLimit); // Group string into sets of 2k chars
    const minusLimit = exports.charLimit - 4;
    // argsFixed.forEach(o => Util.log("---\n" + o));
    let totalBlocks = 0; // Total number of *user created* code blocks come across so far (therefore if the number is odd then code block is currently open)
    for (let i = 0; i < argsFixed.length; i++) {
        let passOver = ''; // String to pass over as the start of the next chunk
        let msg = argsFixed[i];
        const numBlock = (msg.match(/```/g) || []).length; // Number of user created code blocks in this chunk
        if (totalBlocks % 2 == 1) msg = `\`\`\`\n${msg}`; // If code block is currently open then this chunk needs to be formatted
        totalBlocks += numBlock; // The user created code blocks may close/open new code block (don't need to include added ones because they just account for separate messages)
        let lastIsOpener = totalBlocks % 2 == 1; // Checks whether the last code block is an opener or a closer
        if (lastIsOpener && msg.length > minusLimit) { // If the chunk ends with the code block still open then it needs to be auto-closed so the chunk needs to be shortened so it can fit
            passOver = msg.substring(minusLimit);
            msg = msg.substr(0, minusLimit);
            const numPass = (passOver.match(/```/g) || []).length; // If we end up passing over code blocks whilst trying to shorten the string, we need to account for the new amount
            totalBlocks -= numPass;
            if (numPass % 2 == 1) lastIsOpener = false;
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
        //Util.log("Original message length: " + msg.length);
        if (msg.length > 1996) {
            passOver = msg.substring(1996);
            msg = msg.substring(0, 1996);
            //Util.log("passStart orig: " + passOver.length);
            var lastLine = msg.lastIndexOf("\n");
            if (lastLine >= 5) {
                var msgEnd = lastLine;
                var passStart = msgEnd+1;
                passOver = msg.substring(passStart) + passOver;
                msg = msg.substring(0, msgEnd);
                //Util.log("passOver: " + passOver.length);
                //Util.log("msg: " + msg.length);
                //Util.log("lastLine: " + lastLine);
            }
        }
        var numBlock = (msg.match(/```/g) || []).length;
        if (numBlock % 2 == 1) {
            passOver = "```\n" + passOver;
            msg = msg + "\n```";
        }
        argsFixed[i] = msg;
        //Util.log("Message length: " + msg.length);
        //Util.log("Pass Over: " + passOver.length);
        if (passOver != "" && (argsFixed[i+1] != null || passOver != "```\n")) {
            if (argsFixed[i+1] == null) {
                //Util.log("Created new print block extender")
                argsFixed[i+1] = "";
            }
            argsFixed[i+1] = passOver + argsFixed[i+1];
        }
    }

    return argsFixed;
} */

exports.splitMessagesOld = function (messages) {
    const fixed = exports.fixMessageLengthNew(messages.join(' '));
    return fixed;
};

exports.escapeRegExp = function (str) {
    return str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
};

function getMatchesWithBlock(str, matchChars, blockChars, useInside) { // Gets all matches of a substring that are in/out of a code block
    const pattern = new RegExp(exports.escapeRegExp(blockChars), 'g');
    let result;

    let numMatches = 0;
    let strPointer = 0;
    let newStr = '';

    while (result = pattern.exec(str)) {
        numMatches++;
        if (useInside) {
            if (numMatches % 2 == 1) { // Open block
                newStr += '.'.repeat(result.index - strPointer);
                strPointer = result.index;
            } else { // Close block (Store data)
                newStr += '.'.repeat(blockChars.length) + str.substring(strPointer + blockChars.length, result.index);
                strPointer = result.index;
            }
        } else {
            if (numMatches % 2 == 1) { // Open block (Store data)
                newStr += str.substring(strPointer, result.index);
                strPointer = result.index;
            } else { // Close block
                newStr += '.'.repeat(result.index - strPointer + blockChars.length);
                strPointer = result.index + blockChars.length;
            }
        }
    }

    if (useInside) {
        newStr += '.'.repeat(str.length - strPointer);
    } else {
        newStr += str.substring(strPointer);
    }

    if (newStr.length != str.length) throw new Error('[E_GetMatchesWithBlock] Failed because the output string didn\'t match input string length');

    return (newStr.match(new RegExp(exports.escapeRegExp(matchChars), 'g')) || []);
}

/*

    chunkMessage
        -Split messages into chunks <= exports.charLimit characters
        -Chunks retain format (`, ``, ```, *, **, ***, _, __, ___) and thus account for fitting in format characters
        -Message splitting focuses on retaining format over reducing number of chunks:
            End ```
            Newline + Newline
            Newline + Format character(s)
            Newline
            Space
            Any
        -Make it so that if last chunk continued string onto next chunk, next chunk cuts at end of that string
*/

const formatSets = [
    ['___', '__'],
    ['***', '**', '*'],
    ['```', '``', '`'],
];

const splitSets = [ // pivot: -1 = Split Start, 0 = Remove, 1 = Split End
    { chars: '```', pivot: 1 }, // Only applies to end ```
    { chars: '\n\n', pivot: 0 },
    { chars: '\n', pivot: 0 },
    { chars: ' ', pivot: 0 },
];

const leaveExtra = formatSets.reduce((a, b) => a.concat(b)).length * 2;

function chunkMessage(msg) {
    const origChunks = [msg];
    let content = msg;
    let appendBeginning = [];

    const baseChunkSize = exports.charLimit - leaveExtra;

    for (let i = 0; content; ++i, content = origChunks[i]) {
        for (let j = 0; j < appendBeginning.length; j++) {
            content = appendBeginning[j] + content;
        }

        if (content.length < exports.charLimit) {
            origChunks[i] = content;
            break;
        }

        let chunk = content.substr(0, baseChunkSize);
        let leftOver;

        appendBeginning = [];

        for (let j = 0; j < splitSets.length; j++) {
            const splitSet = splitSets[j];
            const splitChars = splitSet.chars;
            const splitType = splitSet.pivot;

            let pivotStart = chunk.lastIndexOf(splitChars); // exclusive
            let pivotEnd = pivotStart; // inclusive

            if (pivotStart == -1) continue;

            if (splitType == 1) { // Split End
                pivotStart += splitChars.length;
                pivotEnd = pivotStart;
            } else if (splitType == 0) { // Remove
                pivotEnd += splitChars.length;
            }

            let chunkTemp = chunk.substring(0, pivotStart);

            if (splitChars == '```') { // Has to be closing a block
                const numSets = (chunkTemp.match(new RegExp(exports.escapeRegExp(splitChars), 'g')) || []).length;
                if (numSets % 2 == 1) {
                    if (numSets == 1) continue;
                    pivotStart = chunk.substring(0, pivotStart - splitChars.length).lastIndexOf(splitChars);
                    if (pivotStart == -1) continue;
                    pivotStart += splitChars.length;
                    pivotEnd = pivotStart;
                    chunkTemp = chunk.substring(0, pivotStart);
                }
            }

            if (chunkTemp.length <= leaveExtra) continue;

            Util.log(`Split on ${splitChars} @ ${pivotStart} @ ${pivotEnd}`);

            chunk = chunkTemp;
            leftOver = content.substr(pivotEnd);

            /* if (i == 1) {
                Util.log(chunkTemp);
                Util.log('---');
                Util.log(leftOver);
            } */

            break;
        }

        if (leftOver == null) {
            Util.log('Split on last');
            leftOver = content.substr(baseChunkSize);
        }

        for (let j = 0; j < formatSets.length; j++) {
            const formatSet = formatSets[j];

            for (let k = 0; k < formatSet.length; k++) {
                const formatChars = formatSet[k];
                const numSets = getMatchesWithBlock(chunk, formatChars, '```', false).length; // Should really only be counting matches not inside code blocks

                if (numSets % 2 == 1) {
                    chunk += formatChars;
                    appendBeginning.push(formatChars);
                    break;
                }
            }
        }

        if (chunk.substr(chunk.length - 3, 3) == '```') appendBeginning.push('​\n');

        origChunks[i] = chunk;

        if (leftOver && leftOver.length > 0) origChunks.push(leftOver);
    }

    return origChunks;
}

exports.splitMessages = function (messages) {
    return chunkMessage(messages.join(' '));
};

exports.print = function (channel, ...args) {
    const messages = exports.splitMessages(args);
    const promises = [];
    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        // Util.log(`${channel.name}: ${msg.length}`);
        const msgPromise = channel.send(msg);
        msgPromise.catch((err) => {
            console.log('[PRINT_CATCH]', err);
        });
        promises.push(msgPromise);
    }
    return Promise.all(promises);
};

const printPromise = async (channel, msg, resolveData, resolveErr) => {
    try {
        const data = await channel.send(msg);
        resolveData.push(data);
    } catch (err) {
        resolveErr.push(err);
        console.log('[PRINT_CATCH]', err);
    }
};

exports.print = async function (channel, ...args) {
    const messages = Util.splitMessages(args);
    const resolveData = [];
    const resolveErr = [];
    const promises = [];
    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        promises.push(printPromise(channel, msg, resolveData, resolveErr));
    }
    try {
        await Promise.all(promises);
        if (resolveData.length > 0 && resolveErr.length === 0) return resolveData[0];
        return resolveErr[0];
    } catch (err) {
        throw new Error("SOMETHING WENT WRONG WITH PRINT'S CODE:", err);
    }
};

exports.sortPerms = function (permsArr) {
    permsArr.sort((a, b) => exports.permissionsOrder[b] - exports.permissionsOrder[a]);
};

exports.getGuildRoles = function (guild) {
    return Array.from(guild.roles.values()).sort((a, b) => b.position - a.position); // From highest to lowest
};

exports.getName = function (userResolvable) {
    if (userResolvable == null) return null;
    if (typeof userResolvable === 'string') return userResolvable;
    return Util.isMember(userResolvable) ? userResolvable.user.username : userResolvable.username;
};

exports.getMostName = function (userResolvable) {
    if (userResolvable == null) return null;
    if (typeof userResolvable === 'string') return userResolvable;
    const username = exports.getName(userResolvable);
    const discrim = Util.isMember(userResolvable) ? userResolvable.user.discriminator : userResolvable.discriminator;
    return `${username}#${discrim}`;
};

exports.getFullName = function (userResolvable, strict) {
    if (userResolvable == null) return strict ? null : 'null'; // TODO: Make strict default at some point
    if (typeof userResolvable === 'string') return userResolvable;
    const mostName = exports.getMostName(userResolvable);
    return `${mostName} (${userResolvable.id})`;
};

exports.getDisplayName = function (member) {
    const result = member.displayName || member.username;
    return result;
};

exports.getMention = function (userResolvable, full) {
    let out;

    if (userResolvable.user) { // Member
        out = userResolvable.toString();
    } else if (userResolvable.id) { // User
        out = full ? exports.getFullName(userResolvable) : exports.getMostName(userResolvable);
    } else { // Id
        out = `<@${userResolvable}>`;
    }

    return out;
};

exports.getAvatar = function (userResolvable, outStr) {
    if (userResolvable != null && exports.isObject(userResolvable)) {
        if (userResolvable.user) userResolvable = userResolvable.user;
        // return userResolvable.displayAvatarURL({ format: 'png' });
        return userResolvable.displayAvatarURL;
    }
    return (outStr === true ? 'null' : null);
};

exports.isLoud = function (channel) {
    const guild = channel.guild;

    const botRegex = /\bbot\b|commands/i;
    const botRegex2 = /\bbot\b/i;
    const botRegex3 = /commands/i;

    if (!botRegex.test(channel.name)) {
        let botChannel = guild.channels.find(c => botRegex2.test(c.name) && botRegex3.test(c.name));
        if (!botChannel) botChannel = guild.channels.find(c => botRegex.test(c.name));

        if (botChannel) {
            exports.print(channel, `Please use ${botChannel}`);
        } else {
            exports.print(
                channel,
                'Please get the server staff to create a bot commands channel (or to make sure any existing one has "bot" or "commands" in the name)',
            );
        }

        return true;
    }

    return false;
};

exports.getDateString = function (d) {
    if (d == null) d = new Date();
    const result = `${DateFormat(d, 'ddd, mmm dS yyyy @ h:MM TT')} GMT`;
    return result;
};

exports.hasRole = (member, role) => member.roles.has(role.id);

exports.hasRoleName = (member, name) => {
    name = name.toLowerCase();
    const hasRoleVal = member.roles.some(role => role.name.toLowerCase().includes(name));
    return hasRoleVal;
};

exports.makeEmbedFooter = function (user, dateParam) {
    const memberName = exports.isObject(user) ? exports.getDisplayName(user) : String(user);
    let date = dateParam;
    if (date == null) date = new Date();
    const dateStr = exports.getDateString(date);
    return { text: `${memberName} | ${dateStr}`, icon_url: exports.getAvatar(user) };
};

exports.getSuffix = function (n) {
    const j = n % 10;
    const k = n % 100;
    if (j == 1 && k != 11) {
        return `${n}st`;
    }
    if (j == 2 && k != 12) {
        return `${n}nd`;
    }
    if (j == 3 && k != 13) {
        return `${n}rd`;
    }
    return `${n}th`;
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

    for (let i = embFields.length - 1; i >= 0; i--) {
        if (!embFields[i].name) embFields.splice(i, 1);
    }

    if (embFields.length > 25) {
        manyFields = true;
        extraFields = embFields.splice(25);
    }

    for (let i = 0; i < embFields.length; i++) {
        const nowField = embFields[i];

        if (!has.call(nowField, 'inline')) nowField.inline = true;

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

    // console.log(1111, embObj);

    embChannel.send(undefined, { embed: embObj })
        .then(() => {
            // console.log(2222);
        })
        .catch((error) => {
            // console.log(3333);
            Util.log(`[E_SendEmbed] ${error} ${embChannel}`);
            Util.log(embObj);
            Util.log(JSON.stringify(embFields));
        });

    if (manyFields) {
        exports.sendEmbed(embChannel, embTitle, embDesc, embFooter, embImage, embColor, extraFields, true);
    }
};

exports.sendDescEmbed = function (embChannel, embTitle, embDesc, embFooter, embImage, embColorParam) {
    if (embChannel == null) return;

    let embColor = embColorParam;

    if (embColor == null) embColor = colBlue;

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

    for (let i = embFields.length - 1; i >= 0; i--) {
        if (!embFields[i].name) embFields.splice(i, 1);
    }

    const embedTitleLower = embTitle.toLowerCase();

    const logChannel = exports.findChannel('vaebot-log', embGuild);
    if (logChannel) {
        const embFooter = exports.makeEmbedFooter(embAuthor);
        const embAvatar = exports.getAvatar(embAuthor);

        exports.sendEmbed(
            logChannel,
            exports.cloneObj(embTitle),
            null,
            exports.cloneObj(embFooter),
            exports.cloneObj(embAvatar),
            exports.cloneObj(embColor),
            exports.cloneObj(embFields));
    }

    const regex = /(\S*)(?:warn|mute|kick|ban)/i;
    const pre = (regex.exec(embedTitleLower) || [])[1];

    const modChannel = exports.findChannel('mod-logs', embGuild);
    if (modChannel && pre != null && pre != 'un' && !embedTitleLower.includes('revert') && !embedTitleLower.includes('cleared')) {
        const embFooter = exports.makeEmbedFooter(embAuthor);
        const embAvatar = exports.getAvatar(embAuthor);

        exports.sendEmbed(
            modChannel,
            exports.cloneObj(embTitle),
            null,
            exports.cloneObj(embFooter),
            exports.cloneObj(embAvatar),
            exports.cloneObj(embColor),
            exports.cloneObj(embFields));
    }
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
} */

exports.searchUserPartial = function (container, name) {
    name = name.toLowerCase();
    return container.find((user) => {
        const username = exports.getName(user);
        if (user.id === name || exports.safe(username.toLowerCase()).includes(name)) {
            return true;
        }
        return false;
    });
};

exports.round = function (num, inc) {
    return inc == 0 ? num : Math.floor((num / inc) + 0.5) * inc;
};

exports.write = function (content, name) {
    FileSys.writeFile(name, content);
};

exports.remove = function (name) {
    FileSys.unlink(name);
};

exports.resolveUserMention = function (guild, id) {
    let resolvedUser;

    if (id == null) {
        id = guild;
        resolvedUser = client.users.get(id);
    } else {
        resolvedUser = exports.getMemberById(id, guild);
    }

    if (resolvedUser) return resolvedUser.toString();

    return `<@${id}>`;
};

exports.getNumMutes = async function (id, guild) {
    const pastMutes = await Data.getRecords(guild, 'mutes', { user_id: id });
    return pastMutes.length;
};

exports.historyToStringOld = function (num) {
    let timeHours = exports.round(num / 3600000, 0.1);
    timeHours = (timeHours >= 1 || timeHours == 0) ? timeHours.toFixed(0) : timeHours.toFixed(1);
    Util.log(`[RANDOM] timeHours: ${timeHours}`);
    return timeHours + (timeHours == 1 ? ' hour' : ' hours');
};

exports.historyToStringOld2 = function (num) {
    let timeHours = num / 3600000;
    Util.log(`[RANDOM] timeHours: ${timeHours}`);
    timeHours += (timeHours == 1 ? ' hour' : ' hours');
    return timeHours;
};

exports.historyToString = function (num) {
    const timeStr = exports.formatTime(num);
    return timeStr;
};

exports.matchWholeNumber = function (str) {
    let result = str.match(/^\d*(?:\.\d+)?$/);
    result = result ? result[0] : undefined;
    return result;
};

exports.getSafeId = function (id) {
    id = id.match(/\d+/);

    if (id == null) return undefined;

    return id[0];
};

exports.getMemberById = function (id, guild) {
    if (id == null || guild == null) return null;

    if (id.substr(0, 1) === '<' && id.substr(id.length - 1, 1) === '>') id = exports.getSafeId(id);

    if (id == null || id.length < 1) return null;

    return guild.members.get(id);
};

exports.isId = function (str) {
    let id = str.match(/^\d+$/);

    if (id == null) {
        id = str.match(/^<.?(\d+)>$/);
        if (id == null) return undefined;
        id = id[1];
    } else {
        id = id[0];
    }

    if (id.length < 17 || id.length > 19) return undefined;

    return id;
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
        const perc = 1 - (totalPosition * nameMatch == 0 ? 0.001 : nameMatch / totalPosition);
        value += 2 ** perc;
    }

    return value;
};

exports.getDiscriminatorFromName = function (name) {
    const discrimPattern = /#(\d\d\d\d)$/gm;
    let discrim = discrimPattern.exec(name);
    discrim = discrim ? discrim[1] : null;
    return discrim;
};

exports.isNumeric = function (str) {
    return !isNaN(parseFloat(str)) && isFinite(str);
};

exports.entirelyNumbers = function (str) {
    return /^\d+$/.test(str);
};

exports.getBestMatch = function (container, key, name) { // [v3.0] Visible name match, real name match, length match, caps match, position match
    if (container == null) return undefined;

    let removeUnicode = false;

    if (key === 'username') {
        removeUnicode = true;
        const nameDiscrim = exports.getDiscriminatorFromName(name);
        if (nameDiscrim) {
            const namePre = name.substr(0, name.length - 5);
            const user = container.find(m => m.username === namePre && m.discriminator === nameDiscrim);
            if (user) return user;
        }
    }

    const origName = name.trim();

    if (removeUnicode) {
        name = name.replace(/[^\x00-\x7F]/g, '').trim();
        if (name.length == 0) {
            name = origName;
            removeUnicode = false;
        }
    }

    const str2Lower = name.toLowerCase();
    let strongest = null;

    container.forEach((obj) => {
        let realName = obj[key];
        if (removeUnicode) realName = realName.replace(/[^\x00-\x7F]/g, '');
        realName = realName.trim();
        const nameMatch = realName.toLowerCase().indexOf(str2Lower);

        const strength = { 'obj': obj };
        let layer = 0;

        if (nameMatch >= 0) {
            strength[layer++] = 1;

            // Util.log("(" + i + ") " + realName + ": " + value);
            const filled = Math.min(name.length / realName.length, 0.999);
            // Util.log("filled: " + filled);
            strength[layer++] = filled;

            const maxCaps = Math.min(name.length, realName.length);
            let numCaps = 0;
            for (let j = 0; j < maxCaps; j++) {
                if (name[j] === realName[nameMatch + j]) numCaps++;
            }
            const caps = Math.min(numCaps / maxCaps, 0.999);
            // const capsExp = (filledExp * 0.5 - 1 + caps);
            // Util.log("caps: " + caps + " (" + numCaps + "/" + maxCaps + ")");
            strength[layer++] = caps;

            const totalPosition = realName.length - name.length;
            const perc = 1 - (totalPosition * nameMatch == 0 ? 0.001 : nameMatch / totalPosition);
            // const percExp = (capsExp - 2 + perc);
            // Util.log("pos: " + perc + " (" + nameMatch + "/" + totalPosition + ")");
            strength[layer++] = perc;

            if (strongest == null) {
                strongest = strength;
            } else {
                for (let i = 0; i < layer; i++) {
                    if (strength[i] > strongest[i]) {
                        strongest = strength;
                        break;
                    } else if (strength[i] < strongest[i]) {
                        break;
                    }
                }
            }
        }
    });

    return strongest != null ? strongest.obj : undefined;
};

exports.getMemberByName = function (name, guild) { // [v3.0] Visible name match, real name match, length match, caps match, position match
    if (guild == null) return undefined;

    const nameDiscrim = exports.getDiscriminatorFromName(name);
    if (nameDiscrim) {
        const namePre = name.substr(0, name.length - 5);
        const member = guild.members.find(m => m.user.username === namePre && m.user.discriminator === nameDiscrim);
        if (member) return member;
    }

    let removeUnicode = true;
    const origName = name.trim();

    name = name.replace(/[^\x00-\x7F]/g, '').trim();

    if (name.length == 0) {
        name = origName;
        removeUnicode = false;
    }

    const str2Lower = name.toLowerCase();
    const members = guild.members;
    let strongest = null;

    if (str2Lower == 'vaeb') {
        const selfMember = members.get(vaebId);
        if (selfMember) return selfMember;
    }

    members.forEach((member) => {
        let realName = member.nickname != null ? member.nickname : exports.getName(member);
        if (removeUnicode) realName = realName.replace(/[^\x00-\x7F]/g, '');
        realName = realName.trim();
        let realstr2Lower = realName.toLowerCase();
        let nameMatch = realstr2Lower.indexOf(str2Lower);

        const strength = { 'member': member };
        let layer = 0;

        if (nameMatch >= 0) {
            strength[layer++] = 2;
        } else {
            realName = exports.getName(member);
            if (removeUnicode) realName = realName.replace(/[^\x00-\x7F]/g, '');
            realName = realName.trim();
            realstr2Lower = realName.toLowerCase();
            nameMatch = realstr2Lower.indexOf(str2Lower);
            if (nameMatch >= 0) {
                strength[layer++] = 1;
            }
        }

        if (nameMatch >= 0) {
            // Util.log("(" + i + ") " + realName + ": " + value);
            const filled = Math.min(name.length / realName.length, 0.999);
            // Util.log("filled: " + filled);
            strength[layer++] = filled;

            const maxCaps = Math.min(name.length, realName.length);
            let numCaps = 0;
            for (let j = 0; j < maxCaps; j++) {
                if (name[j] === realName[nameMatch + j]) numCaps++;
            }
            const caps = Math.min(numCaps / maxCaps, 0.999);
            // const capsExp = (filledExp * 0.5 - 1 + caps);
            // Util.log("caps: " + caps + " (" + numCaps + "/" + maxCaps + ")");
            strength[layer++] = caps;

            const totalPosition = realName.length - name.length;
            const perc = 1 - (totalPosition * nameMatch == 0 ? 0.001 : nameMatch / totalPosition);
            // const percExp = (capsExp - 2 + perc);
            // Util.log("pos: " + perc + " (" + nameMatch + "/" + totalPosition + ")");
            strength[layer++] = perc;

            if (strongest == null) {
                strongest = strength;
            } else {
                for (let i = 0; i < layer; i++) {
                    if (strength[i] > strongest[i]) {
                        strongest = strength;
                        break;
                    } else if (strength[i] < strongest[i]) {
                        break;
                    }
                }
            }
        }
    });

    return strongest != null ? strongest.member : undefined;
};

exports.getMemberByNameOld = function (name, guild) { // [v2.0] Visible name match, real name match, length match, caps match, position match //
    if (guild == null) return undefined;

    const nameDiscrim = exports.getDiscriminatorFromName(name);
    if (nameDiscrim) {
        const namePre = name.substr(0, name.length - 5);
        const member = guild.members.find(m => m.user.username === namePre && m.user.discriminator === nameDiscrim);
        if (member) return member;
    }

    let removeUnicode = true;
    const origName = name.trim();

    name = name.replace(/[^\x00-\x7F]/g, '');
    name = name.trim();

    if (name.length == 0) {
        name = origName;
        removeUnicode = false;
    }

    const str2Lower = name.toLowerCase();

    const members = guild.members;
    const matchStrength = [];
    let strongest = [0, undefined];

    members.forEach((member) => {
        let value = 0;

        let realName = member.nickname != null ? member.nickname : exports.getName(member);
        if (removeUnicode) realName = realName.replace(/[^\x00-\x7F]/g, '');
        realName = realName.trim();
        let realstr2Lower = realName.toLowerCase();
        let nameMatch = realstr2Lower.indexOf(str2Lower);

        if (nameMatch >= 0) {
            value += 2 ** 5;
        } else {
            realName = exports.getName(member);
            if (removeUnicode) realName = realName.replace(/[^\x00-\x7F]/g, '');
            realName = realName.trim();
            realstr2Lower = realName.toLowerCase();
            nameMatch = realstr2Lower.indexOf(str2Lower);
            if (nameMatch >= 0) {
                value += 2 ** 4;
            }
        }

        if (nameMatch >= 0) {
            // Util.log("(" + i + ") " + realName + ": " + value);
            const filled = Math.min(name.length / realName.length, 0.999);
            const filledExp = (2 + filled);
            // Util.log("filled: " + filled);
            value += 2 ** filledExp;

            const maxCaps = Math.min(name.length, realName.length);
            let numCaps = 0;
            for (let j = 0; j < maxCaps; j++) {
                if (name[j] === realName[nameMatch + j]) numCaps++;
            }
            const caps = Math.min(numCaps / maxCaps, 0.999);
            // const capsExp = (filledExp * 0.5 - 1 + caps);
            const capsExp = (1 + caps);
            // Util.log("caps: " + caps + " (" + numCaps + "/" + maxCaps + ")");
            value += 2 ** capsExp;

            const totalPosition = realName.length - name.length;
            const perc = 1 - (totalPosition * nameMatch == 0 ? 0.001 : nameMatch / totalPosition);
            // const percExp = (capsExp - 2 + perc);
            const percExp = (0 + perc);
            // Util.log("pos: " + perc + " (" + nameMatch + "/" + totalPosition + ")");
            value += 2 ** percExp;

            // Util.log(value);
            matchStrength.push([value, member]);
        }
    });

    for (let i = 0; i < matchStrength.length; i++) {
        const strength = matchStrength[i];
        if (strength[0] > strongest[0]) strongest = strength;
    }

    return strongest[1];
};

function getDataFromStringInner(str, funcs, returnExtra) {
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
                    Util.log("[Z] " + combine.join(" "));
                    Util.log("[Z] " + remainingFuncs);
                    Util.log("[Z] " + remainingTerms);
                    Util.log("[Z] " + pos);
                    Util.log("[Z] " + start);
                    Util.log("[Z] " + end);
                    Util.log("[Z] " + result);
                } */
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
}

/*

    If optional parameters:
        -Fixed order
        -Only one function per optional parameter (so no need for putting each function in its own array)
        -Some optional parameters might only be an option if a previous optional parameter exists
        -Some optional parameters might not have a space before them
        -Don't know which parameters are being used

    ;cmd optionalParam1 name optionalParam2DependsOnOP1 optionalParam2 time

    const data = Util.getDataFromString(args,
        [
            {
                func: function (str) {
                    return Util.getMemberByMixed(str, guild) || Util.isId(str);
                },
            },
            {
                func: function (str) {
                    const timeHours = Util.matchWholeNumber(str);
                    return timeHours;
                },
                optional: true,
            },
            {
                func: function (str) {
                    let mult;
                    str = str.toLowerCase();
                    if (str.substr(str.length - 1, 1) == 's' && str.length > 2) str = str.substr(0, str.length - 1);
                    if (str == 'millisecond' || str == 'ms') mult = 1 / 60 / 60 / 1000;
                    if (str == 'second' || str == 's' || str == 'sec') mult = 1 / 60 / 60;
                    if (str == 'minute' || str == 'm' || str == 'min') mult = 1 / 60;
                    if (str == 'hour' || str == 'h') mult = 1;
                    if (str == 'day' || str == 'd') mult = 24;
                    if (str == 'week' || str == 'w') mult = 24 * 7;
                    if (str == 'month' || str == 'mo') mult = 24 * 30.42;
                    if (str == 'year' || str == 'y') mult = 24 * 365.2422;
                    return mult;
                },
                optional: true,
                requires: 1,
                prefix: / ?/,
            },
        ]
    , true);

    - Get all possible variations that match the prefixes

*/

exports.getDataFromString = function (str, funcSets, returnExtra) {
    if (typeof funcSets[0] == 'function') return getDataFromStringInner(str, funcSets, returnExtra);

    const mainData = getDataFromStringInner(str, funcSets[0], returnExtra);

    if (!mainData) return mainData;

    let lastExtra = mainData[funcSets[0].length];
    mainData.splice(funcSets[0].length);

    for (let i = 1; i < funcSets.length; i++) {
        if (!lastExtra || lastExtra.length == 0) break;
        const nowData = getDataFromStringInner(lastExtra, funcSets[i], returnExtra);
        if (nowData) {
            for (let j = 0; j < funcSets[i].length; j++) mainData.push(nowData[j]);
            lastExtra = nowData[funcSets[i].length];
        } else {
            for (let j = 0; j < funcSets[i].length; j++) mainData.push(null);
        }
    }

    mainData.push(lastExtra);

    return mainData;
};

function matchSet(str, funcSets, setIndex, data) {
    if (setIndex >= funcSets.length) {
        return true;
    }
    data.fail = Math.max(data.fail, setIndex);
    Util.log(`Loop ${setIndex}`);
    const set = funcSets[setIndex++];
    if (set.requires && data[set.requires] === undefined) {
        Util.log('Missing requires');
        if (!set.optional) return false;
        data.push(undefined);
        if (matchSet(str, funcSets, setIndex, data)) return true;
        data.pop();
    } else if (str.length === 0) {
        for (let i = setIndex - 1, s; s = funcSets[i]; i++) {
            if (!s.optional) return false;
        }
        return true;
    }
    const pMatch = str.match(set.prefix || (setIndex === 1 ? /\s*/ : /\s+/));
    Util.log('\t', pMatch, setIndex, set.prefix || (setIndex === 1 ? /\s*/ : /\s+/));
    if (!pMatch) return false;
    if (pMatch.index !== 0) return false;
    str = str.substr(pMatch[0].length);
    for (let i = str.length; i >= 0; i--) {
        const part = str.substr(0, i);
        // Util.log(`\tchecking part ${part}`);
        let good = true;
        if (set.match) {
            const mMatch = part.match(set.match);
            good = mMatch[0] == part;
        }
        const res = good && set.func(part);
        if (!res || !good) continue;
        // Util.log("Got", res, "for", data.length, "with length", i);
        data.push(res);
        const left = str.substr(i);
        if (matchSet(left, funcSets, setIndex, data)) {
            // Util.log("Reached the end, yeuy!");
            return true;
        }
        data.pop();
        if (set.longest) return false;
    }
    if (!set.optional) return false;
    return matchSet(str, funcSets, setIndex, data);
}

exports.getDataFromString2 = function (str, funcSets, returnExtra) {
    const data = [];
    data.fail = 0;
    const done = [];
    if (returnExtra) {
        funcSets.push({
            func(extra) {
                return extra;
            },
            optional: true,
        });
    }
    const success = matchSet(str, funcSets, 0, data, done);
    data.success = success;
    if (success) {
        for (let i = data.length; i < funcSets.length; i++) {
            data.push(undefined);
        }
        delete data.fail;
    }
    return data;
};

exports.clamp = function (num, minParam, maxParam) {
    let min = minParam;
    let max = maxParam;
    if (min == null) min = num;
    if (max == null) max = num;
    return Math.min(Math.max(num, min), max);
};

exports.noBlock = function (str) {
    return ` \`\`\`\n${str}\n\`\`\`\n `;
};

exports.toBoolean = function (str) {
    const result = (typeof (str) === 'boolean' ? str : (str === 'true' || (str === 'false' ? false : undefined)));
    return result;
};

exports.getNum = function (str, min, max) {
    const num = Number(str);
    if (isNaN(num)) return undefined;
    return exports.clamp(num, min, max);
};

exports.getInt = function (str, min, max) {
    const num = parseInt(str, 10); // Number() is better generally
    if (isNaN(num)) return undefined;
    return exports.clamp(num, min, max);
};

exports.isTextChannel = channel => channel.type === 'text';

exports.isVoiceChannel = channel => channel.type === 'voice';

exports.getTextChannels = guild => guild.channels.filter(exports.isTextChannel);

exports.getVoiceChannels = guild => guild.channels.filter(exports.isVoiceChannel);

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

exports.isAdmin = function (member) {
    const highestRole = member.highestRole;
    const guildRolesFromTop = exports.getGuildRoles(member.guild);

    for (let i = 0; i < guildRolesFromTop.length; i++) {
        const role = guildRolesFromTop[i];
        if (/\bmod/g.test(role.name.toLowerCase())) {
            return false;
        } else if (role.id == highestRole.id) {
            return true;
        }
    }

    return false;
};

exports.getRole = function (name, obj) {
    if (obj == null) return undefined;

    name = name.toLowerCase();

    const nameId = exports.getSafeId(name);
    const roles = obj.roles;
    if (roles.has(nameId)) return roles.get(nameId);

    const returnRole = exports.getBestMatch(roles, 'name', name);

    return returnRole;
};

exports.getHighestRole = member => member.highestRole;

exports.getPosition = function (speaker) {
    if (speaker == null || !exports.isObject(speaker) || speaker.guild == null) return undefined;

    if (speaker.id === speaker.guild.ownerID) return 999999999;

    return speaker.highestRole.position;
};

exports.getUserById = id => client.users.get(id);

exports.getUserByName = name => exports.getBestMatch(client.users, 'username', name);

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

    if (has.call(allowGeneral, permName)) return allowGeneral[permName];
    if (has.call(allowText, permName)) return allowText[permName];
    if (has.call(allowVoice, permName)) return allowVoice[permName];

    return undefined;
};

exports.getRolePermissions = function (role, channel) {
    const outPerms = [];

    if (!channel) {
        for (let i = 0; i < exports.rolePermissions.length; i++) {
            const permName = exports.rolePermissions[i];
            if (role.hasPermission(permName)) {
                outPerms.push(permName);
            }
        }
    }

    return outPerms;
};

exports.getPermRating = function (guild, userOrRole) {
    if (userOrRole.hasPermission == null) return 0;

    const tempPermRating = Util.cloneObj(Util.permRating);

    let total = 0;
    let foundTop = false;

    for (let i = 0; i < tempPermRating.length; i++) {
        const permData = tempPermRating[i];
        if (userOrRole.hasPermission(permData[0], false)) {
            if (!foundTop && i < tempPermRating.length -1) {
                foundTop = true;

                let lastVal = null;
                let pointer0 = i + 1;
                let pointer1 = i + 1;
                let newVal = 5;

                // Util.log("found", permData[0]);

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

                console.log('qqq', i, pointer0, pointer1);

                const numPoints = (pointer1 - pointer0) + 1;
                newVal /= numPoints;
                for (let n = pointer0; n <= pointer1; n++) {
                    tempPermRating[n][1] = newVal;
                }

                // Util.log(tempPermRating);
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

    str = exports.replaceAll(str.toUpperCase(), ' ', '_');

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
        .catch(error => Util.log(`[E_SetChannelPerms] ${error}`));
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

function mirrorProperties(member) {
    const memberProto = Object.getPrototypeOf(member);
    const userProto = Object.getPrototypeOf(member.user);
    for (const key in member.user) {
        if (!Object.getOwnPropertyDescriptor(memberProto, key)) {
            Object.defineProperty(memberProto, key, {
                get() {
                    return this.user[key];
                },
                set(val) {
                    this.user[key] = val;
                },
            });
        }
    }
    const descriptors = Object.getOwnPropertyDescriptors(userProto);
    for (const key in descriptors) {
        if (!Object.getOwnPropertyDescriptor(memberProto, key)) {
            Object.defineProperty(memberProto, key, {
                get() {
                    return this.user[key];
                },
                set(val) {
                    this.user[key] = val;
                },
            });
        }
    }
}

exports.mergeUser = function (member) {
    // Util.log('Adding new proxy:');
    // Util.log(`Adding proxy to ${String(member)}`);

    /* const oldPrototype = Object.getPrototypeOf(member);

    if (Reflect.has(oldPrototype, 'proxyId')) return false;

    const nowProxyId = proxyId++;

    const userProxy = new Proxy({ proxyId: nowProxyId }, {
        get(storage, prop) {
            Util.log(`Getting ${prop} from ${nowProxyId}`);
            if (Reflect.has(member, prop)) return Reflect.get(member, prop);
            else if (Reflect.has(oldPrototype, prop)) return Reflect.get(oldPrototype, prop, member);
            else if (Reflect.has(member.user, prop)) return Reflect.get(member.user, prop);
            return storage[prop];
        },
        set(storage, prop, val) {
            Util.logc('Setter', 'Setting', prop, 'to', val);
            Reflect.set(member, prop, val); // Could 1st arg be oldPrototype and 4th be member?
            return val;
        },
        getPrototypeOf() {
            return Reflect.getPrototypeOf(member);
        },
    });
    
    Object.setPrototypeOf(member, userProxy); */

    mirrorProperties(member);

    return true;
};

exports.resolveMention = function (userResolvable) {
    if (userResolvable == null) return undefined;
    if (typeof user === 'string') return `<@${userResolvable}>`;
    return `${Util.getMostName(userResolvable)} (${userResolvable.toString()})`;
};

exports.fieldsToDesc = function (fields) {
    return `​\n${fields.filter(fieldData => fieldData.name != null).map(fieldData => `**${fieldData.name}${fieldData.value != null ? ': ' : ''}**${fieldData.value != null ? fieldData.value : ''}`).join('\n\n')}`;
};

exports.resolveUser = function (guild, userResolvable, canBeSystem) { // If user can be system, userResolvable as text would be the bot/system
    if (userResolvable == null) return undefined;

    const resolvedData = {
        member: userResolvable,
        user: userResolvable,
        id: userResolvable,
        mention: userResolvable,
        original: userResolvable,
    };

    let userType = 0; // Member
    let system = false;

    let wasId = false;

    if (typeof userResolvable === 'string') {
        const idMatch = exports.isId(userResolvable);
        if (idMatch) {
            userType = 1; // ID
            resolvedData.id = idMatch;
        } else {
            userType = 2; // Name or System
            system = canBeSystem && userResolvable.match(/[a-z]/i); // When resolving with system possibility the only use of text should be when the moderator is the system.
        }
    }

    // exports.logc('Admin1', `User type: ${userType} (canBeSystem ${canBeSystem || false})`);

    if (userType === 0) { // Member or User
        if (!userResolvable.guild) resolvedData.member = guild.members.get(resolvedData.user.id); // User
        else resolvedData.user = resolvedData.member.user; // Member
        resolvedData.id = resolvedData.user.id;
        resolvedData.mention = exports.resolveMention(resolvedData.member || resolvedData.user);
    } else if (userType === 1) { // Contained ID
        resolvedData.member = guild.members.get(resolvedData.id);
        resolvedData.user = resolvedData.member ? resolvedData.member.user : client.users.get(resolvedData.id);
        if (!resolvedData.user) { // Could be a name imitating an ID
            wasId = true;
            userType = 2;
        } else {
            resolvedData.mention = exports.resolveMention(resolvedData.member || resolvedData.user);
        }
    }

    if (userType === 2) { // Name or System (Separate if statement for branching from userType_1)
        if (system) { // VaeBot
            resolvedData.member = guild.members.get(selfId);
            resolvedData.user = resolvedData.member.user;
            resolvedData.id = selfId;
        } else { // Name
            resolvedData.member = exports.getMemberByMixed(userResolvable, guild);
            resolvedData.user = resolvedData.member ? resolvedData.member.user : exports.getUserByName(userResolvable);
            if (resolvedData.user) {
                resolvedData.id = resolvedData.user.id;
                resolvedData.mention = exports.resolveMention(resolvedData.member || resolvedData.user);
            } else if (!wasId) { // Didn't branch from id
                return 'User not found'; // No user or member
            }
        }
    }

    return resolvedData; // [Definite Values] ID: Always | Mention: Always | Member/User: All inputs except ID and Name
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

    Util.log(`Received ${messages.length}, left: ${left}`);

    if (left <= 0) return Promise.resolve();

    return exports.fetchMessagesEx(channel, left, store, messages[messages.length - 1]);
};

exports.updateMessageCache = function (channel, speaker) {
    exports.fetchMessagesEx(channel, 100, [], channel.messages[0]).then(() => {
        if (speaker) {
            exports.sendDescEmbed(channel, 'Message Cache', 'Refreshed', exports.makeEmbedFooter(speaker), null, colGreen);
        }
    });
};

exports.isMember = function (userRes) {
    if (userRes.user != null) return true;
    return false;
};

exports.getUser = function (userRes) {
    if (!userRes) return null;
    return userRes.user || userRes;
};

exports.isMap = function (obj) {
    return obj instanceof Map;
};

exports.arrayToCollection = function (arr) {
    const newCol = new Discord.Collection();
    for (let i = 0; i < arr.length; i++) {
        const value = arr[i];
        newCol.set(value.id, value);
    }
    return newCol;
};

exports.chunkObj = function (obj, chunkSize) {
    const chunks = [];
    if (exports.isMap(obj)) {
        const objArray = obj.array();
        const size = obj.size;
        for (let i = 0; i < size; i += chunkSize) {
            const chunkArr = objArray.slice(i, i + chunkSize);
            const chunk = exports.arrayToCollection(chunkArr);
            chunks.push(chunk);
        }
    } else {
        const size = obj.length;
        for (let i = 0; i < size; i += chunkSize) {
            const chunk = obj.slice(i, i + chunkSize);
            chunks.push(chunk);
        }
    }
    return chunks;
};

exports.deleteMessages = function (messages) {
    let numMessages;
    let firstMessage;

    if (exports.isMap(messages)) {
        numMessages = messages.size;
        firstMessage = messages.first();
    } else {
        numMessages = messages.length;
        firstMessage = messages[0];
    }

    if (numMessages < 1) {
        Util.log('You must have at least 1 message to delete');
    } else {
        Util.log(`Deleting ${numMessages} messages`);
    }

    if (numMessages == 1) {
        firstMessage.delete()
            .catch((err) => {
                Util.log(`[E_DeleteMessages1] ${err}`);
            });
    } else {
        const chunks = exports.chunkObj(messages, 99);
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            firstMessage.channel.bulkDelete(chunk)
                .catch((err) => {
                    Util.log(`[E_DeleteMessages2] ${err}`);
                });
        }
    }
};

async function fetchMessagesInner(channel, remaining, foundMessages, lastMessage) {
    lastMessage = lastMessage != null ? lastMessage.id : undefined;

    const messages = await channel.fetchMessages({ limit: Math.min(remaining, 99), before: lastMessage });

    if (!messages || messages.size == 0) return foundMessages;

    const messagesArr = messages.array();

    for (let i = 0; i < messagesArr.length; i++) {
        foundMessages.push(messagesArr[i]);
    }

    remaining -= messagesArr.length;

    if (remaining <= 0) return foundMessages;

    return fetchMessagesInner(channel, remaining, foundMessages, messagesArr[messagesArr.length - 1]);
}

exports.fetchMessages = async function (channel, numScan, checkFunc) {
    if (!checkFunc) checkFunc = (() => true);

    const scanMessages = await fetchMessagesInner(channel, numScan, [], null);
    const foundMessages = scanMessages.filter(checkFunc);
    Util.log(`Num Messages Found: ${foundMessages.length}`);
    return foundMessages;
};

exports.banMember = function (member, moderator, reason, tempEnd) {
    const guild = member.guild;
    const memberId = member.id;
    const memberMostName = exports.getMostName(member);

    if (reason == null || reason.length < 1) reason = 'No reason provided';

    let modFullName = moderator;
    if (exports.isObject(moderator)) modFullName = exports.getFullName(moderator);

    const linkedGuilds = Data.getLinkedGuilds(member.guild);

    for (let i = 0; i < linkedGuilds.length; i++) {
        const linkedGuild = linkedGuilds[i];
        linkedGuild.ban(member.id, { days: 0, reason })
            .then((userResolvable) => {
                Util.logc('AddBan1', `Link-added ban for ${exports.getMention(userResolvable, true)} @ ${linkedGuild.name}`);
            })
            .catch(exports.logErr);
    }

    const sendLogData = [
        `Guild ${tempEnd ? 'Temporary ' : ''}Ban`,
        guild,
        member,
        { name: 'Username', value: member.toString() },
        { name: 'Moderator', value: member.toString() },
        { name: 'Ban Reason', value: reason },
    ];

    if (tempEnd) sendLogData.push({ name: 'Ban Ends', value: tempEnd });

    exports.sendLog(sendLogData, colAction);

    // Trello.addCard(member.guild, 'Bans', memberMostName, {
    //     'User ID': memberId,
    //     'Moderator': modFullName,
    //     'Reason': `[TempBan] ${reason}`,
    // });

    return true;
};

exports.kickMember = function (member, moderator, reason) {
    // const memberId = member.id;
    // const memberMostName = exports.getMostName(member);

    if (reason == null || reason.length < 1) reason = 'No reason provided';

    // let modFullName = moderator;
    // if (exports.isObject(moderator)) modFullName = exports.getFullName(moderator);

    member.kick()
        .catch(console.error);

    // Trello.addCard(member.guild, 'Kicks', memberMostName, {
    //     'User ID': memberId,
    //     'Moderator': modFullName,
    //     'Reason': reason,
    // });
};

exports.getChanges = function (str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = []; // len1+1, len2+1

    if (len1 == 0) {
        return len2;
    } else if (len2 == 0) {
        return len1;
    } else if (str1 == str2) {
        return 0;
    }

    for (let i = 0; i <= len1; i++) {
        matrix[i] = {};
        matrix[i][0] = i;
    }

    for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            let cost = 1;

            if (str1[i - 1] == str2[j - 1]) {
                cost = 0;
            }

            matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
        }
    }

    return matrix[len1][len2];
};

exports.getLines = function (str) {
    return str.split(/\r\n|\r|\n/);
};

exports.getLines2 = function (str) {
    return exports.chunkString(str, 153); // Take 153 characters as average line length on average 1080p window
};

exports.simplifyStr = function (str) {
    str = str.toLowerCase();
    const strLength = str.length;
    const midPoint = (str.length / 2) + 1;
    for (let i = 1; i < midPoint; i++) { // Increment for number of characters in the string stopping before the last (no need to check if whole string is a repetition of itself)
        const sub = str.substr(0, i); // Get the substring from start of length i
        const num = Math.floor(strLength / i); // Get the number of times i goes into the length of the substring (number of times to repeat sub to make it fit)
        const repeatedSub = sub.repeat(num); // Repeat the substring floor(num) times
        if (repeatedSub == str) return [sub, num]; // If repeatedSub is equal to original string, return substring and repetition count
    }
    return [str, 1]; // Return substring and repetition count
};

exports.simplifyStrHeavy = function (str) {
    // Assume str is already lowercase
    str = str.replace(/\s/g, '');
    const strLength = str.length;
    const midPoint = (str.length / 2) + 1; // The first int x for which floor(strLength / x) is 1, a.k.a the length when a substring is too large to repeat and fit into str
    let numCanChange = 0;
    let nextInc = 2;
    for (let i = 1; i < midPoint; i++) { // Increments for number of characters in the string stopping before the midpoint
        const sub = str.substr(0, i); // Get the str substring of length i
        const num = Math.floor(strLength / i); // Get the number of times i goes into the length of the substring (number of times to repeat sub to make it fit)
        const repeatedSub = sub.repeat(num); // Repeat the substring num times
        const nowMaxChanges = Math.min(numCanChange * num, strLength / 2); // Get number of allowed alterations between strings to be classed as similar
        if (exports.getChanges(repeatedSub, str) <= nowMaxChanges) return [sub, num]; // If repeatedSub is similar to original string, return substring and repetition count
        if (i >= nextInc) { // Update multiplier for nowMaxChanges when length is large enough
            numCanChange++;
            nextInc *= 2;
        }
    }
    return [str, 1]; // Return substring and repetition count
};

exports.similarStrings = function (str1, str2) {
    str1 = str1.toLowerCase().trim();
    str2 = str2.toLowerCase().trim();

    // Get number of allowed alterations between strings to be classed as similar
    let maxChanges = Math.floor(Math.min(Math.max(Math.max(str1.length, str2.length) / 3, Math.abs(str2.length - str1.length)), 6));

    // Check if the original strings are similar (have a number of alterations between them [levenshtein distance] less/equal to maxChanges)
    if (exports.getChanges(str1, str2) <= maxChanges) return true;

    // Simplify both strings removing repeated similar data
    [str1] = exports.simplifyStrHeavy(str1); // Reduce similar repeated strings (e.g. dog1dog2dog3 becomes dog1)
    [str2] = exports.simplifyStrHeavy(str2);

    // Update maxChanges for new string lengths
    maxChanges = Math.floor(Math.min(Math.max(Math.max(str1.length, str2.length) / 3, Math.abs(str2.length - str1.length)), 6));

    // Check if simplified strings are similar
    return exports.getChanges(str1, str2) <= maxChanges;
};

exports.similarStringsStrict = function (str1, str2) {
    str1 = str1.toLowerCase().trim();
    str2 = str2.toLowerCase().trim();

    const minStr = str1.length < str2.length ? str1 : str2;
    const maxStr = str1.length < str2.length ? str2 : str1;

    if (minStr.replace(/[|. ,/#!$%^&*;:{}=\-_`~()]/g, '').length < 10 && (str1.match(/\s/g) || []).length < 2 && (str2.match(/\s/g) || []).length < 2) return false;

    // if ((minLen < 4) && (minLen != 3 || maxLen < 4)) return str1 == str2;

    // Get number of allowed alterations between strings to be classed as similar
    let maxChanges = maxStr.length / 3;
    maxChanges = Math.max(maxChanges, Math.abs(str2.length - str1.length));
    maxChanges = Math.min(maxChanges, 6);
    maxChanges = Math.floor(maxChanges);

    // const maxChanges = Math.floor(Math.min(Math.max(Math.max(str1.length, str2.length) / 3, Math.abs(str2.length - str1.length)), 6));

    // Check if the original strings are similar (have a number of alterations between them [levenshtein distance] less/equal to maxChanges)
    if (exports.getChanges(str1, str2) <= maxChanges) return true;

    return false;
};

exports.isSpam = function (content) {
    if (exports.getLines2(content).length >= 500) return true; // If the message contains too many chunk-lines (so characters) consider it spam

    const strLines = exports.getLines(content);

    if (strLines.length > 1) {
        let numSimilar = 0;
        let mostCommon = strLines[0];
        let numLines = strLines.length;

        for (let i = 1; i < strLines.length; i++) {
            const nowStr = strLines[i];
            if (nowStr.trim().length < 1) {
                numLines--;
                continue;
            }
            const compStr = numSimilar === 0 ? strLines[i - 1] : mostCommon;
            if (exports.similarStrings(nowStr, compStr)) {
                if (numSimilar === 0) mostCommon = nowStr;
                numSimilar++;
            } else if (i === 2 && numSimilar === 0 && exports.similarStrings(nowStr, mostCommon)) {
                numSimilar++;
            }
        }

        if (numSimilar >= 3 || numSimilar == numLines) return true;
    }

    // ////////////////////////////////////////////////////////////////////////////////////////

    const pattern = /\S+/g; // Pattern for finding all matches for continuous substrings of non space characters
    const matches = content.match(pattern); // Get the matches

    for (let i = 0; i < matches.length; i++) { // Iterate through the matches
        // Util.log(`---${i + 1}---`);
        for (let j = 0; j < matches.length; j++) { // Iterate through the matches again in each iteration for concatenating multiple adjacent matches
            let long = matches[j]; // Get the substring on non space characters
            if (j + i >= matches.length) continue; // If there isn't a match at index j+i it can't be concatenated to joined-substring so skip
            for (let k = 1; k <= i; k++) long += matches[j + k]; // Concatenate all matches after the one at j, onto the match at j, up until (inclusive) the match at i
            // Util.log(long);
            const [sub, num] = exports.simplifyStr(long); // Simplify the resultant concatenated substring that is made up of the match at j and the following matched substrings, to see if it consists of one repeated substring
            // sub: The substring that can be repeated to make up the long var
            // num: The number of times the substring needs to be repeated to make up the long var
            const subLength = sub.length; // The number of characters in the repeated substring
            let triggered = false; // Initialise spam detection variable
            if (num >= 3) { // Only check for spam if substring has been repeated at least 3 times
                if (subLength == 1) { // 1 character in substring, 100+ repetitions
                    if (num >= 100) triggered = true; // Is spam
                } else if (subLength == 2) { // 2 characters in substring, 20+ repetitions
                    if (num >= 20) triggered = true; // Is spam
                } else if (subLength == 3) { // 3 characters in substring, 7+ repetitions
                    if (num >= 7) triggered = true; // Is spam
                } else if (subLength <= 5) { // 4-5 characters in substring, 4+ repetitions
                    if (num >= 4) triggered = true; // Is spam
                } else { // 6+ characters in substring, 3+ repetitions
                    triggered = true; // Is spam
                }
            }
            if (triggered) { // If it was counted as spam
                Util.log(long, ':', sub, ':', num);
                return true; // Return true (spam)
            }
        }
    }

    return false; // Return false (not spam)
};

exports.reverse = function (str) {
    return str.split('').reverse().join('');
};

exports.format = function (...args) {
    const newArgs = [];

    for (let i = 0; i < args.length; i++) {
        newArgs[i] = exports.cloneObjDepth(args[i], 2);
    }

    return NodeUtil.format(...newArgs);
};

let lastTag = null;
let lastWasEmpty = true;

function postOutString(args, startNewline) {
    const nowDate = new Date();
    nowDate.setHours(nowDate.getHours() + 1);

    let out = (startNewline && !lastWasEmpty) ? '\n' : '';
    out += NodeUtil.format(...args);

    let outIndex = out.search(/[^\n\r]/g);
    if (outIndex === -1) outIndex = 0;

    out = out.slice(0, outIndex) + DateFormat(nowDate, '| dd/mm/yyyy | HH:MM | ') + out.slice(outIndex);

    console.log(out);

    lastWasEmpty = /[\n\r]\s*$/.test(out);
}

exports.log = function (...args) {
    postOutString(args, true);
    lastTag = null;
};

exports.logc = function (...args) {
    const nowTag = String(args.splice(0, 1)).toLowerCase();
    const isNew = lastTag != nowTag;
    postOutString(args, isNew);
    lastTag = nowTag;
};

exports.logn = function (...args) {
    postOutString(args, false);
    lastTag = null;
};

exports.logErr = function (...args) {
    args.unshift('[ERROR]');
    postOutString(args, true);
    lastTag = null;
};

const getAuditLogChunk = 1;
const getAuditLogMax = 4; // This is completely pointless ...?

async function getAuditLogRec(guild, auditLogOptions, userData, checkedLogs) {
    if (checkedLogs.length >= getAuditLogMax) return null;
    const entries = (await guild.fetchAuditLogs(auditLogOptions)).entries;
    const outLog = entries.find(log => userData.nowTimestamp - log.createdTimestamp < userData.maxElapsed && log.target.id === userData.target.id); // Needs to check latest first
    if (outLog) return outLog;
    entries.forEach((log) => { if (!checkedLogs.includes(log.id)) checkedLogs.push(log.id); });
    auditLogOptions.limit++;
    userData.maxElapsed += 700;
    return getAuditLogRec(guild, auditLogOptions, userData, checkedLogs);
}

exports.getAuditLog = async function (guild, type, userData) {
    userData.executor = Util.resolveUser(guild, userData.executor);

    if (!userData.target) {
        const auditLogOptions = { type, user: userData.executor, limit: 1 };
        return (await guild.fetchAuditLogs(auditLogOptions)).entries.first();
    }

    userData.target = Util.resolveUser(guild, userData.target);
    userData.maxElapsed = userData.maxElapsed || 3000;

    const nowTimestamp = +new Date();
    userData.nowTimestamp = nowTimestamp;

    const auditLogOptions = { type, user: userData.executor, limit: getAuditLogChunk };
    return getAuditLogRec(guild, auditLogOptions, userData, []);
};
