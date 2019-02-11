console.log('\n-STARTING-\n');

// //////////////////////////////////////////////////////////////////////////////////////////////

const Auth = require('./Auth.js');

process.on('unhandledRejection', (error) => {
    console.log('>>> Uncaught Promise Error <<<');
    console.error(error);
    process.exit(1);
});

exports.FileSys = require('fs');
exports.DateFormat = require('dateformat');
exports.Request = require('request');
exports.Urban = require('urban');
const TrelloObj = require('node-trello');
exports.Ytdl = require('ytdl-core');
exports.Path = require('path');
exports.NodeOpus = require('node-opus');
exports.Exec = require('child_process').exec;
const YtInfoObj = require('youtube-node');
exports.Translate = require('google-translate-api');
exports.MySQL = require('mysql');
exports.NodeUtil = require('util');
// exports.YoutubeSearch = require('youtube-search');

exports.YtInfo = new YtInfoObj();
exports.TrelloHandler = new TrelloObj(Auth.trelloKey, Auth.trelloToken);

exports.linkGuilds = [['417110408088780801', '309785618932563968']];

exports.dbPass = Auth.dbPass;
exports.dbPassVeil = Auth.dbPassVeil;

// //////////////////////////////////////////////////////////////////////////////////////////////

global.index = module.exports;

global.has = Object.prototype.hasOwnProperty;
global.selfId = '224529399003742210';
global.vaebId = '107593015014486016';
global.botDir = '/home/flipflop8421/files/discordExp/VaeBot'; // '/home/flipflop8421/files/discordExp/VaeBot' 'C:\\Users\\Adam\\Documents\\GitVaeb\\VaeBot'

global.Util = require('./Util.js');
global.Data = require('./core/ManageData.js');
global.Trello = require('./core/ManageTrello.js');
global.Admin = require('./core/ManageAdmin.js');
global.Music = require('./core/ManageMusic.js');
global.Music2 = require('./core/ManageMusic2.js');
global.Cmds = require('./core/ManageCommands.js');
global.Events = require('./core/ManageEvents.js');
global.Discord = require('discord.js');

/* Discord.BaseGuildMember = Discord.GuildMember;

Discord.NewGuildMember = class extends Discord.BaseGuildMember {
    constructor(guild, data) {
        super(guild, data);
        Util.mergeUser(this);
    }
}; */

/* class ExtendableProxy {
    constructor(guild, data) {
        const OriginalGuildMember = new Discord.BaseGuildMember(guild, data);

        return new Proxy(this, {
            get: (object, key) => {
                return OriginalGuildMember[key];
            },
            set: (object, key, value) => {
                OriginalGuildMember[key] = value;
                return value;
            },
        });
    }
}

Discord.GuildMember = class extends ExtendableProxy {}; */

/* Discord.GuildMember.prototype.getProp = function (p) {
    if (this[p] != null) return this[p];
    return this.user[p];
};

Discord.User.prototype.getProp = function (p) {
    return this[p];
}; */

exports.YtInfo.setKey(Auth.youtube);

global.client = new Discord.Client({
    disabledEvents: ['TYPING_START'],
    fetchAllMembers: true,
    disableEveryone: true,
});

// //////////////////////////////////////////////////////////////////////////////////////////////

exports.dailyMutes = [];
exports.dailyKicks = [];
exports.dailyBans = [];

exports.commandTypes = {
    locked: 'vaeb',
    administrator: 'administrator',
    staff: 'staff',
    public: 'null',
};

const briefHour = 2;
const msToHours = 1 / (1000 * 60 * 60);
const dayMS = 24 / msToHours;
let madeBriefing = false;

global.colAction = 0xf44336; // Log of action, e.g. action from within command
global.colUser = 0x4caf50; // Log of member change
global.colMessage = 0xffeb3b; // Log of message change
global.colCommand = 0x2196f3; // Log of command being executed

global.colGreen = 0x00e676;
global.colBlue = 0x00bcd4;

exports.blockedUsers = {};
exports.blockedWords = [];

exports.runFuncs = [];
exports.warnedImage = {};

// //////////////////////////////////////////////////////////////////////////////////////////////

function setBriefing() {
    setTimeout(() => {
        const time1 = new Date();
        const time2 = new Date();

        time2.setHours(briefHour);
        time2.setMinutes(0);
        time2.setSeconds(0);
        time2.setMilliseconds(0);

        const t1 = +time1;
        const t2 = +time2;
        let t3 = t2 - t1;
        if (t3 < 0) t3 += dayMS;

        const channel = client.channels.get('168744024931434498');
        // const guild = channel.guild;

        Util.log(`Set daily briefing for ${t3 * msToHours} hours`);

        setTimeout(() => {
            // const upField = { name: '​', value: '​', inline: false };
            const muteField = { name: 'Mutes', value: 'No mutes today', inline: false };
            // var rightField = {name: "​", value: "​"}
            const kickField = { name: 'Kicks', value: 'No kicks today', inline: false };
            const banField = { name: 'Bans', value: 'No bans today', inline: false };

            const embFields = [muteField, kickField, banField];

            const embObj = {
                title: 'Daily Briefing',
                description: '​',
                fields: embFields,
                footer: { text: '>> More info in #vaebot-log <<' },
                thumbnail: { url: './resources/avatar.png' },
                color: colGreen,
            };

            if (exports.dailyMutes.length > 0) {
                const dataValues = [];

                for (let i = 0; i < exports.dailyMutes.length; i++) {
                    const nowData = exports.dailyMutes[i];
                    const userId = nowData[0];
                    // const userName = nowData[1];
                    const userReason = nowData[2];
                    // const userTime = nowData[3];
                    const targMention = `<@${userId}>`;
                    let reasonStr = '';
                    if (userReason != null && userReason.trim().length > 0) {
                        reasonStr = ` : ${userReason}`;
                    }
                    dataValues.push(targMention + reasonStr);
                }

                muteField.value = dataValues.join('\n\n');
            }

            muteField.value = `​\n${muteField.value}\n​`;

            if (exports.dailyKicks.length > 0) {
                const dataValues = [];

                for (let i = 0; i < exports.dailyKicks.length; i++) {
                    const nowData = exports.dailyKicks[i];
                    const userId = nowData[0];
                    // const userName = nowData[1];
                    const userReason = nowData[2];
                    const targMention = `<@${userId}>`;
                    let reasonStr = '';
                    if (userReason != null && userReason.trim().length > 0) {
                        reasonStr = ` : ${userReason}`;
                    }
                    dataValues.push(targMention + reasonStr);
                }

                kickField.value = dataValues.join('\n\n');
            }

            kickField.value = `​\n${kickField.value}\n​`;

            if (exports.dailyBans.length > 0) {
                const dataValues = [];

                for (let i = 0; i < exports.dailyBans.length; i++) {
                    const nowData = exports.dailyBans[i];
                    const userId = nowData[0];
                    // const userName = nowData[1];
                    const userReason = nowData[2];
                    const targMention = `<@${userId}>`;
                    let reasonStr = '';
                    if (userReason != null && userReason.trim().length > 0) {
                        reasonStr = ` : ${userReason}`;
                    }
                    dataValues.push(targMention + reasonStr);
                }

                banField.value = dataValues.join('\n\n');
            }

            banField.value = `​\n${banField.value}\n​`;

            if (exports.dailyMutes.length > 0 || exports.dailyKicks.length > 0 || exports.dailyBans.length > 0) {
                channel.send(undefined, { embed: embObj }).catch(error => Util.log(`[E_SendBriefing] ${error}`));
            }

            exports.dailyMutes = []; // Reset
            exports.dailyKicks = [];
            exports.dailyBans = [];

            setBriefing();
        }, t3);
    }, 2000); // Let's wait 2 seconds before starting countdown, just in case of floating point errors triggering multiple countdowns
}

exports.globalBan = {
    '201740276472086528': true, // No idea
    '75736018761818112': true, // No idea
    '123146298504380416': true, // No idea
    '263372398059847681': true, // No idea
    '238981466606927873': true, // Lindah
    '189687397951209472': true, // xCraySECx / Nico Nico
    '154255141317378050': true, // HighDefinition
    '157749388964265985': true, // Zetroxer
    '280419231181307906': true, // Solarical
    '169261309353918464': true, // Slappy826
    '331958080164200453': true, // derickbuum
    '284410389469593611': true, // Papi
    '255779902387650560': true, // Shiro's Twin
    '80385350316339200': true, // Fennec
    '175013861701713920': true, // chrome
};

function securityFunc(guild, member, sendRoleParam) {
    const guildName = guild.name;
    // const guildId = guild.id;

    const memberId = member.id;
    const memberName = Util.getFullName(member);

    let sendRole = sendRoleParam;
    if (sendRole == null) sendRole = Util.getRole('SendMessages', guild);

    if (has.call(exports.globalBan, memberId)) {
        member.kick().catch(console.error);
        Util.logc('BanOld1', `Globally banned user ${memberName} had already joined ${guildName}`);
        return;
    }

    if (sendRole != null) {
        const isMuted = Admin.checkMuted(guild, memberId);
        if (isMuted) {
            if (Util.hasRole(member, sendRole)) {
                member.removeRole(sendRole).catch(console.error);
                Util.logc('MuteOld1', `Removed SendMessages from muted user ${memberName} who had already joined ${guildName}`);
            }
        } else if (!Util.hasRole(member, sendRole)) {
            member.addRole(sendRole).catch(console.error);
            Util.logc('AssignOld1', `Assigned SendMessages to old member ${memberName}`);
        }
    }
}

function setupSecurity(guild) {
    const sendRole = Util.getRole('SendMessages', guild);

    Util.logc('Security1', `Setting up security for ${guild.name} (${guild.members.size} members)`);

    guild.members.forEach((member) => {
        securityFunc(guild, member, sendRole);
    });
}

exports.setupSecurityFunc = setupSecurity;

function setupSecurityVeil() {
    const veilGuild = client.guilds.get('477270527535480834');
    if (!veilGuild) return Util.logc('SecureVeil1', '[ERROR_VP] Veil guild not found!');
    const guild = client.guilds.get('309785618932563968');
    if (!guild) return Util.logc('SecureVeil1', '[ERROR_VP] New Veil guild not found!');
    const veilBuyer = veilGuild.roles.find('name', 'Vashta-Owner');
    if (!veilBuyer) return Util.logc('SecureVeil1', '[ERROR_VP] Veil Buyer role not found!');
    const newBuyer = guild.roles.find('name', 'Vashta-Owner');
    if (!newBuyer) return Util.logc('SecureVeil1', '[ERROR_VP] New Buyer role not found!');
    // const guildId = guild.id;
    // const guildName = guild.name;

    Util.logc('SecureVeil1', `Setting up auto-kick for ${guild.name} (${guild.members.size} members)`);

    guild.members.forEach((member) => {
        const memberId = member.id;

        if (memberId === vaebId || memberId === selfId) return;

        const memberName = Util.getFullName(member);
        const veilMember = Util.getMemberById(memberId, veilGuild);
        if (!veilMember) {
            Util.logc('SecureVeil1', `[Auto-Old-Kick 1] User not in Veil: ${memberName}`);
            member.kick().catch(error => Util.logc('SecureVeil1', `[E_AutoOldKick1] ${memberName} | ${error}`));
            return;
        }
        if (!veilMember.roles.has(veilBuyer.id)) {
            Util.logc('SecureVeil1', `[Auto-Old-Kick 2] User does not have Buyer role: ${memberName}`);
            member.kick().catch(error => Util.logc('SecureVeil1', `[E_AutoOldKick2] ${memberName} | ${error}`));
            return;
        }
        if (!member.roles.has(newBuyer.id)) {
            member.addRole(newBuyer).catch(error => Util.logc('SecureVeil1', `[E_AutoOldAddRole1] ${memberName} | ${error}`));
            Util.logc('SecureVeil1', `Updated old member with Buyer role: ${memberName}`);
        }
    });

    return undefined;
}

const veilGuilds = {
    '477270527535480834': true,
    '309785618932563968': true,
};

exports.secure = async function () {
    Util.log('> Securing guilds...');

    let securityNum = 0;
    const veilGuildsNum = Object.keys(veilGuilds).length;

    await Promise.all(
        client.guilds.map(async (newGuild) => {
            await newGuild.fetchMembers();

            if (has.call(veilGuilds, newGuild.id)) {
                securityNum++;
                if (securityNum === veilGuildsNum) setupSecurityVeil();
            }

            setupSecurity(newGuild);

            Trello.setupCache(newGuild);
        }),
    );

    Util.log('> Security setup complete');
};

/* function notifyOn(channel) { // Not if the last message was a reminder...
    // Util.sendDescEmbed(channel, 'Reminder', 'You can gain access to the #anime channel by sending a message saying: `;toggle anime`', null, null, colBlue);
} */

// //////////////////////////////////////////////////////////////////////////////////////////////

Cmds.initCommands();

// Index_Ready -> Data_SQL -> Mutes_Initialize -> Index_Secure

client.on('ready', async () => {
    Util.log(`> Connected as ${client.user.username}!`);

    if (madeBriefing === false) {
        madeBriefing = true;
        setBriefing();
    }

    Util.log('> Start caching guild members');

    const dbGuilds = [];

    await Promise.all(
        client.guilds.map(async (newGuild) => {
            await newGuild.fetchMembers();

            const allMembers = newGuild.members;

            // allMembers.forEach(m => Util.mergeUser(m));
            allMembers.forEach(Util.mergeUser);
            Util.logc('InitProxy', `Added proxies to the ${allMembers.size} members of ${newGuild.name}`);

            // Music2.initGuild(newGuild);

            if (newGuild.id == '477270527535480834') dbGuilds.push(newGuild);
        }),
    )
        .then(() => Util.log('> Cached all guild members'))
        .catch(e => Util.log('> Error while caching guild members:', e));

    // Util.log('> Cached all guild members!');

    await Data.connectInitial(dbGuilds);
});

client.on('disconnect', (closeEvent) => {
    Util.log('DISCONNECTED');
    Util.log(closeEvent);
    Util.log(`Code: ${closeEvent.code}`);
    Util.log(`Reason: ${closeEvent.reason}`);
    Util.log(`Clean: ${closeEvent.wasClean}`);
});

client.on('guildCreate', (guild) => {
    guild.fetchMembers().then(() => {
        const allMembers = guild.members;
        allMembers.forEach(m => Util.mergeUser(m));
    });
});

client.on('guildMemberRemove', (member) => {
    const guild = member.guild;

    if (exports.raidMode[guild.id]) return;

    Events.emit(guild, 'UserLeave', member);

    const sendLogData = [
        'User Left',
        guild,
        member,
        { name: 'Username', value: Util.resolveMention(member) },
        { name: 'Highest Role', value: member.highestRole.name },
    ];

    Util.sendLog(sendLogData, colUser);
});

exports.newMemberTime = 1000 * 16;
exports.newMemberTime2 = 1000 * 60 * 1;
exports.recentMembers = [];
exports.recentMembers2 = [];

const youngAccountTime = 1000 * 60 * 60 * 24 * 6.5;

function raidBan(member, defaultChannel, banMsg) {
    member
        .ban()
        .then(() => {
            if (defaultChannel) defaultChannel.send(banMsg).catch(console.error);
        })
        .catch(console.error);
}

const raidMsgPossible = `Hi! Unfortunately you've joined our Vashta Discord whilst the server is being raided, so you've been automatically treated as a raider and banned from our server.

It's not all bad though, looking at the details of your account there's a possibility that you aren't a raider, so if that is the case then you'll probably be unbanned shortly and can rejoin, if so I apologise for the trouble.

If you don't get unbanned for some reason (and you aren't trying to raid us), please contact Vaeb#0001 (<@107593015014486016>) my developer, and he will sort you out. If you are a raider, better luck next time.

As a reminder, here's our server invite for if you're a real human and will be joining us later, or if you're a raider and want to try again: https://discord.gg/bvS5gwY`;

// exports.checkRaidMember = function (member, joinStamp, defaultChannel) {
//     const createdAt = +member.user.createdAt;
//     const memberName = `${member.user.username}#${member.user.discriminator} (${member.id})`;

//     if (createdAt == null || joinStamp - createdAt < youngAccountTime) {
//         raidBan(member, defaultChannel, `Auto-banned detected raider: ${memberName}`);
//     } else {
//         member
//             .send(raidMsgPossible)
//             .then(() => raidBan(member, defaultChannel, `Auto-removed possible raider: ${memberName}`))
//             .catch(() => raidBan(member, defaultChannel, `Auto-removed possible raider: ${memberName}`));
//     }
// };

exports.checkRaidMember = function (member, joinStamp, defaultChannel, sendRole) {
    const createdAt = +member.user.createdAt;
    if (createdAt == null || joinStamp - createdAt < youngAccountTime) {
        member.ban().catch(console.error);
        if (defaultChannel) {
            const memberName = `${member.user.username}#${member.user.discriminator} (${member.id})`;
            defaultChannel.send(`Auto-banned detected raider: ${memberName}`).catch(console.error);
        }
    } else if (sendRole && Util.hasRole(member, sendRole)) {
        member.removeRole(sendRole).catch(console.error);
    }
};

exports.disableRaidMode = function (guild, defaultChannel) {
    exports.raidMode[guild.id] = undefined;

    if (!defaultChannel) {
        defaultChannel = guild.channels.find(c => c.name === 'general') || guild.channels.find(c => c.name === 'lounge');
    }

    const botRole = guild.roles.find(r => r.name.startsWith('Server Bot'));
    if (botRole) {
        botRole.edit({ name: 'Server Bot', color: '#8c7ae6' }).catch(console.error);
    }

    Util.log('Raid mode disabled');
    Util.print(defaultChannel, 'Raid mode disabled');

    exports.setupSecurityFunc(guild);
};

exports.activateRaidMode = function (guild, defaultChannel, wasAuto) {
    exports.raidMode[guild.id] = true;

    const raidingMembers = exports.recentMembers2.slice();

    const joinStamp = +new Date();
    const sendRole = Util.getRole('SendMessages', guild);

    if (!defaultChannel) {
        defaultChannel = guild.channels.find(c => c.name === 'general') || guild.channels.find(c => c.name === 'lounge');
    }

    Util.log('Raid mode enabled');

    const modRole = guild.roles.find(r => r.name === 'Moderator');
    const modeRoleStr = modRole ? ` ${modRole}` : '';
    if (defaultChannel) {
        Util.print(
            defaultChannel,
            wasAuto ? `Raid detected - Raid mode has been automatically activated${modeRoleStr}` : 'Raid mode activated',
        );
    }

    const botRole = guild.roles.find(r => r.name.startsWith('Server Bot'));
    if (botRole) {
        botRole.edit({ name: 'Server Bot [RAIDMODE]', color: '#eb2f06' }).catch(console.error);
    }

    for (let i = 0; i < raidingMembers.length; i++) {
        const member = guild.members.get(raidingMembers[i].id);
        if (member) exports.checkRaidMember(member, joinStamp, defaultChannel, sendRole);
    }
};

client.on('guildMemberAdd', (member) => {
    const guild = member.guild;
    const joinStamp = +new Date();

    if (exports.raidMode[guild.id]) {
        const defaultChannel = guild.channels.find(c => c.name === 'general') || guild.channels.find(c => c.name === 'lounge');
        const sendRole = Util.getRole('SendMessages', guild);
        exports.checkRaidMember(member, joinStamp, defaultChannel, sendRole);
        return;
    }

    // Check raid mode

    if (!exports.recentMembers.some(memberData => memberData.id === member.id)) {
        exports.recentMembers.push({ id: member.id, joinStamp });
        exports.recentMembers = exports.recentMembers.filter(memberData => joinStamp - memberData.joinStamp < exports.newMemberTime);
    }

    if (!exports.recentMembers2.some(memberData => memberData.id === member.id)) {
        exports.recentMembers2.push({ id: member.id, joinStamp });
        exports.recentMembers2 = exports.recentMembers2.filter(memberData => joinStamp - memberData.joinStamp < exports.newMemberTime2);
    }

    if (exports.recentMembers.length >= (joinStamp - guild.createdTimestamp > 1000 * 60 * 60 * 24 ? 7 : 20)) {
        exports.activateRaidMode(guild, null, true);

        return;
    }

    // Member joined

    const guildName = guild.name;
    const memberId = member.id;
    const memberName = Util.getFullName(member);

    Util.logc(memberId, `User joined: ${memberName} (${memberId}) @ ${guildName}`);

    Util.mergeUser(member);

    // Protect Veil Private

    if (guild.id === '309785618932563968') {
        const veilGuild = client.guilds.get('477270527535480834');
        const veilBuyer = veilGuild.roles.find('name', 'Vashta-Owner');
        const newBuyer = guild.roles.find('name', 'Vashta-Owner');
        if (!veilGuild) {
            Util.logc(memberId, '[ERROR_VP] Veil guild not found!');
        } else if (!veilBuyer) {
            Util.logc(memberId, '[ERROR_VP] Veil Buyer role not found!');
        } else if (!newBuyer) {
            Util.logc(memberId, '[ERROR_VP] New Buyer role not found!');
        } else {
            const veilMember = Util.getMemberById(memberId, veilGuild);
            if (!veilMember) {
                Util.logc(memberId, `[Auto-Kick 1] User not in Veil: ${memberName}`);
                member.kick().catch(error => Util.logc(memberId, `[E_AutoKick1] ${error}`));
                return;
            }
            if (!veilMember.roles.has(veilBuyer.id)) {
                Util.logc(memberId, `[Auto-Kick 2] User does not have Buyer role: ${memberName}`);
                member.kick().catch(error => Util.logc(memberId, `[E_AutoKick2] ${error}`));
                return;
            }
            member.addRole(newBuyer).catch(error => Util.logc(memberId, `[E_AutoAddRole1] ${error}`));
            Util.logc(memberId, 'Awarded new member with Buyer role');
        }
    }

    // Restore buyer role

    // if (guild.id == '477270527535480834') {
    //     Data.query(`SELECT * FROM Users WHERE Disabled IS NULL AND DiscordId=${member.id};`, null, Data.connectionVeil).then((whitelistData) => {
    //         if (whitelistData.length > 0) {
    //             const buyerRole = Util.getRole('Vashta-Owner', guild);
    //             if (buyerRole) {
    //                 member.addRole(buyerRole)
    //                     .catch(Util.logErr);
    //                 Util.logc(member.id, `Assigned Buyer to new buyer ${memberName} who just joined ${guildName}`);
    //             }
    //         }
    //     });
    // }

    // GlobalBan

    if (has.call(exports.globalBan, memberId)) {
        member.kick().catch(console.error);
        Util.logc(memberId, `Globally banned user ${memberName} joined ${guildName}`);
        return;
    }

    // Restore mute

    const isMuted = Admin.checkMuted(guild, memberId);
    if (isMuted) {
        Util.logc(memberId, `Muted user ${memberName} joined ${guildName}`);
    } else {
        const sendRole = Util.getRole('SendMessages', guild);

        if (sendRole) {
            member.addRole(sendRole).catch(console.error);
            Util.logc(memberId, `Assigned SendMessages to new member ${memberName}`);
        }
    }

    Data.getRecords(guild, 'members', { user_id: member.id }).then((results) => {
        const isBuyer = Util.hasRoleName(member, 'Vashta-Owner');
        if (results.length == 0 && isBuyer) {
            Data.addRecord(guild, 'members', { user_id: member.id, buyer: isBuyer ? 1 : 0 });
            Util.logc(memberId, `Adding new member ${Util.getFullName(member)} to MySQL DB`);
        }
    });

    if (memberId === '280579952263430145') member.setNickname('<- mentally challenged');

    Events.emit(guild, 'UserJoin', member);

    const sendLogData = ['User Joined', guild, member, { name: 'Username', value: Util.resolveMention(member) }];

    Util.sendLog(sendLogData, colUser);
});

client.on('guildMemberUpdate', (oldMember, member) => {
    const guild = member.guild;

    if (exports.raidMode[guild.id]) return;

    const previousNick = oldMember.nickname;
    const nowNick = member.nickname;
    const oldRoles = oldMember.roles;
    const nowRoles = member.roles;

    const rolesAdded = nowRoles.filter(role => !oldRoles.has(role.id));

    const rolesRemoved = oldRoles.filter(role => !nowRoles.has(role.id));

    if (rolesAdded.size > 0) {
        rolesAdded.forEach((nowRole) => {
            if (
                (member.id === '214047714059616257' || member.id === '148931616452902912') &&
                (nowRole.id === '293458258042159104' || nowRole.id === '284761589155102720')
            ) {
                member.removeRole(nowRole).catch(console.error);
            }

            if (nowRole.name === 'Vashta-Owner' && guild.id === '477270527535480834') {
                /* const message = 'Please join the Veil Buyers Discord:\n\nhttps://discord.gg/PRq6fcg\n\nThis is very important, thank you.';
                const title = 'Congratulations on your purchase of Veil';
                const footer = Util.makeEmbedFooter('AutoMessage');

                Util.sendDescEmbed(member, title, message, footer, null, colBlue); */
            }

            if (nowRole.name.includes('Mod') && member.id == '202660584330625024') {
                member.removeRole(nowRole).catch(console.error);
            }

            const isMuted = Admin.checkMuted(guild, member.id);
            if (nowRole.name === 'SendMessages' && isMuted) {
                member.removeRole(nowRole).catch(console.error);
                Util.log(`Force re-muted ${Util.getName(member)} (${member.id})`);
            } else {
                const sendLogData = [
                    'Role Added',
                    guild,
                    member,
                    { name: 'Username', value: member.toString() },
                    { name: 'Role Name', value: nowRole.name },
                ];
                Util.sendLog(sendLogData, colUser);
            }

            if (nowRole.name === 'Vashta-Owner') {
                Data.getRecords(guild, 'members', { user_id: member.id, buyer: 1 }).then((results) => {
                    if (results.length == 0) {
                        Data.addRecord(guild, 'members', { user_id: member.id, buyer: 1 });
                        Util.logc('BuyerAdd1', `Adding ${Util.getFullName(member)} as a buyer in MySQL DB`);
                    }
                });
            }

            Events.emit(guild, 'UserRoleAdd', member, nowRole);
        });
    }

    if (rolesRemoved.size > 0) {
        rolesRemoved.forEach((nowRole) => {
            const isMuted = Admin.checkMuted(guild, member.id);
            if (nowRole.name === 'SendMessages' && !isMuted) {
                member.addRole(nowRole).catch(console.error);
                Util.log(`Force re-unmuted ${Util.getName(member)} (${member.id})`);
            } else {
                const sendLogData = [
                    'Role Removed',
                    guild,
                    member,
                    { name: 'Username', value: member.toString() },
                    { name: 'Role Name', value: nowRole.name },
                ];
                Util.sendLog(sendLogData, colUser);
            }

            if (nowRole.name === 'Vashta-Owner') {
                Data.getRecords(guild, 'members', { user_id: member.id, buyer: 1 }).then((results) => {
                    if (results.length > 0) {
                        Data.addRecord(guild, 'members', { user_id: member.id, buyer: 0 });
                        Util.logc('BuyerAdd1', `Removed ${Util.getFullName(member)} as a buyer in MySQL DB`);
                    }
                });
            }

            Events.emit(guild, 'UserRoleRemove', member, nowRole);
        });
    }

    if (previousNick !== nowNick) {
        if (member.id === '280579952263430145' && nowNick !== '<- mentally challenged') member.setNickname('<- mentally challenged');
        Events.emit(guild, 'UserNicknameUpdate', member, previousNick, nowNick);

        const sendLogData = [
            'Nickname Updated',
            guild,
            member,
            { name: 'Username', value: member.toString() },
            { name: 'Old Nickname', value: previousNick },
            { name: 'New Nickname', value: nowNick },
        ];
        Util.sendLog(sendLogData, colUser);
    }
});

/* client.on('userUpdate', (oldUser, user) => {
    const oldUsername = oldUser.username;
    const newUsername = user.username;

    if (oldUsername !== newUsername) {
        Events.emit(guild, 'UserNicknameUpdate', member, previousNick, nowNick);

        const sendLogData = [
            'Username Updated',
            guild,
            member,
            { name: 'Username', value: member.toString() },
            { name: 'Old Nickname', value: previousNick },
            { name: 'New Nickname', value: nowNick },
        ];
        Util.sendLog(sendLogData, colUser);
    }
}); */

client.on('messageUpdate', (oldMsgObj, newMsgObj) => {
    if (newMsgObj == null) return;
    const channel = newMsgObj.channel;
    if (channel.name === 'vaebot-log') return;
    const guild = newMsgObj.guild;
    const member = newMsgObj.member;
    const author = newMsgObj.author;
    const content = newMsgObj.content;
    const contentLower = content.toLowerCase();
    // const isStaff = author.id == vaebId;
    // const msgId = newMsgObj.id;

    const oldContent = oldMsgObj.content;

    for (let i = 0; i < exports.blockedWords.length; i++) {
        if (contentLower.includes(exports.blockedWords[i].toLowerCase())) {
            newMsgObj.delete();
            return;
        }
    }

    if (exports.runFuncs.length > 0) {
        for (let i = 0; i < exports.runFuncs.length; i++) {
            exports.runFuncs[i](newMsgObj, member, channel, guild, true);
        }
    }

    Events.emit(guild, 'MessageUpdate', member, channel, oldContent, content);

    if (oldContent !== content) {
        const sendLogData = [
            'Message Updated',
            guild,
            author,
            { name: 'Username', value: Util.resolveMention(author) },
            { name: 'Channel Name', value: channel.toString() },
            { name: 'Old Message', value: oldContent },
            { name: 'New Message', value: content },
        ];
        Util.sendLog(sendLogData, colMessage);
    }
});

exports.lockChannel = null;

exports.calmSpeed = 7000;
exports.slowChat = {};
exports.raidMode = {};
exports.slowInterval = {};
exports.chatQueue = {};
exports.chatNext = {};

client.on('voiceStateUpdate', (oldMember, member) => {
    const oldChannel = oldMember.voiceChannel; // May be null
    const newChannel = member.voiceChannel; // May be null

    const oldChannelId = oldChannel ? oldChannel.id : null;
    const newChannelId = newChannel ? newChannel.id : null;

    // const guild = member.guild;

    if (member.id === selfId) {
        if (member.serverMute) {
            member.setMute(false);
            Util.log('Force removed server-mute from bot');
        }

        if (exports.lockChannel != null && oldChannelId === exports.lockChannel && newChannelId !== exports.lockChannel) {
            Util.log('Force re-joined locked channel');
            oldChannel.join();
        }
    }
});

/*

Audit log types

const Actions = {
  ALL: null,
  GUILD_UPDATE: 1,
  CHANNEL_CREATE: 10,
  CHANNEL_UPDATE: 11,
  CHANNEL_DELETE: 12,
  CHANNEL_OVERWRITE_CREATE: 13,
  CHANNEL_OVERWRITE_UPDATE: 14,
  CHANNEL_OVERWRITE_DELETE: 15,
  MEMBER_KICK: 20,
  MEMBER_PRUNE: 21,
  MEMBER_BAN_ADD: 22,
  MEMBER_BAN_REMOVE: 23,
  MEMBER_UPDATE: 24,
  MEMBER_ROLE_UPDATE: 25,
  ROLE_CREATE: 30,
  ROLE_UPDATE: 31,
  ROLE_DELETE: 32,
  INVITE_CREATE: 40,
  INVITE_UPDATE: 41,
  INVITE_DELETE: 42,
  WEBHOOK_CREATE: 50,
  WEBHOOK_UPDATE: 51,
  WEBHOOK_DELETE: 52,
  EMOJI_CREATE: 60,
  EMOJI_UPDATE: 61,
  EMOJI_DELETE: 62,
  MESSAGE_DELETE: 72,
};

*/

/* function chooseRelevantEntry(entries, options) {
    if (options.action == null || options.time == null) {
        Util.log(options);
        Util.log('Options did not contain necessary properties');
        return undefined;
    }

    const strongest = [null, null];

    entries.forEach((entry) => {
        if (entry.action !== options.action || (options.target != null && entry.target.id !== options.target.id)) return;

        const timeScore = -Math.abs(options.time - entry.createdTimestamp);

        if (strongest[0] == null || timeScore > strongest[0]) {
            strongest[0] = timeScore;
            strongest[1] = entry;
        }
    });

    return strongest[1];
} */

client.on('messageDelete', (msgObj) => {
    if (msgObj == null) return;
    const channel = msgObj.channel;
    const guild = msgObj.guild;
    const member = msgObj.member;
    const author = msgObj.author;
    const content = msgObj.content;

    // const eventTime = +new Date();

    // const evTime = +new Date();

    // const contentLower = content.toLowerCase();
    // const isStaff = author.id == vaebId;
    // const msgId = msgObj.id;

    // if (author.id === vaebId) return;

    Events.emit(guild, 'MessageDelete', member, channel, content);

    if (guild != null) {
        const attachmentLinks = [];
        msgObj.attachments.forEach(obj => attachmentLinks.push(obj.url));

        // Util.getAuditLog(guild, 'MESSAGE_DELETE', { target: author }).then((auditEntry) => { // WILL FIX LATER
        //     auditEntry = auditEntry || {};
        //     const executor = auditEntry.executor;
        //     // const sinceAuditLog = executor ? eventTime - auditEntry.createdTimestamp : 0;

        //     // if (executor) Util.log(`[MESSAGE_DELETE] Elapsed since audit log: ${sinceAuditLog}`);

        //     const sendLogData = [
        //         'Message Deleted',
        //         guild,
        //         author,
        //         { name: 'User', value: Util.resolveMention(author) },
        //         executor ? { name: 'Possible Moderator', value: Util.resolveMention(executor) } : {},
        //         { name: 'Channel Name', value: channel.toString() },
        //         { name: 'Message', value: content },
        //         { name: 'Attachments', value: attachmentLinks.join('\n') },
        //     ];
        //     Util.sendLog(sendLogData, colMessage);
        // });

        const sendLogData = [
            'Message Deleted',
            guild,
            author,
            { name: 'User', value: Util.resolveMention(author) },
            { name: 'Channel Name', value: channel.toString() },
            { name: 'Message', value: content },
            { name: 'Attachments', value: attachmentLinks.join('\n') },
        ];
        Util.sendLog(sendLogData, colMessage);

        /* setTimeout(() => {
            guild.fetchAuditLogs({
                // user: member,
                type: 72,
            })
            .then((logs) => {
                Util.log('[MD] Got audit log data');
                const entries = logs.entries;

                const entry = chooseRelevantEntry(entries, {
                    time: evTime,
                    target: author,
                    action: 'MESSAGE_DELETE',
                });

                Util.log(entry);

                Util.log(entry.executor.toString());
                Util.log(entry.target.toString());

                const sendLogData = [
                    'Message Deleted',
                    guild,
                    author,
                    { name: 'Username', value: author.toString() },
                    { name: 'Moderator', value: entry.executor.toString() },
                    { name: 'Channel Name', value: channel.toString() },
                    { name: 'Message', value: content },
                ];
                Util.sendLog(sendLogData, colMessage);
            })
            .catch((error) => {
                Util.log(error);
                Util.log('[MD] Failed to get audit log data');
            });
        }, 5000); */
    }
});

const messageStamps = {};
const userStatus = {};
const lastWarn = {};
const checkMessages = 5; // (n)
const warnGrad = 11.5; // Higher = More Spam (Messages per Second) | 10 = 1 message per second
const sameGrad = 4;
const muteGrad = 8.5; // 9
const waitTime = 5.5;
const endAlert = 40;

/* const replaceAll = function (str, search, replacement) {
    return str.split(search).join(replacement);
};
let contentLower = 'lol <qe23> tege <> <e321z> dz';
contentLower = contentLower.replace(/<[^ ]*?[:#@][^ ]*?>/gm, '');
// contentLower = replaceAll(contentLower, ' ', '');
Util.log(contentLower); */

// exports.runFuncs.push((msgObj, speaker, channel, guild) => { // More sensitive
//     if (guild == null || msgObj == null || speaker == null || speaker.user.bot === true || speaker.id === vaebId) return;

//     let contentLower = msgObj.content.toLowerCase();
//     contentLower = contentLower.replace(/<[^ ]*?[:#@][^ ]*?>/gm, '');
//     contentLower = Util.replaceAll(contentLower, ' ', '');
//     contentLower = Util.replaceAll(contentLower, 'one', '1');
//     contentLower = Util.replaceAll(contentLower, 'won', '1');
//     contentLower = Util.replaceAll(contentLower, 'uno', '1');
//     contentLower = Util.replaceAll(contentLower, 'una', '1');
//     contentLower = Util.replaceAll(contentLower, 'two', '2');
//     contentLower = Util.replaceAll(contentLower, 'dose', '2');
//     contentLower = Util.replaceAll(contentLower, 'dos', '2');
//     contentLower = Util.replaceAll(contentLower, 'too', '2');
//     contentLower = Util.replaceAll(contentLower, 'to', '2');
//     contentLower = Util.replaceAll(contentLower, 'three', '3');
//     contentLower = Util.replaceAll(contentLower, 'tres', '3');
//     contentLower = Util.replaceAll(contentLower, 'free', '3');

//     let triggered = false;

//     if (contentLower === '3') {
//         triggered = true;
//     } else {
//         // const trigger = [/11./g, /12[^8]/g, /13./g, /21./g, /22./g, /23./g, /31./g, /32[^h]/g, /33./g, /muteme/g, /onet.?o/g, /threet.?o/g];
//         // const trigger = [/[123][123][123]/g, /muteme/g];
//         const trigger = [/[123][^\d]?[^\d]?[123][^\d]?[^\d]?[123]/g, /[123][123]\d/g, /muteme/g];
//         for (let i = 0; i < trigger.length; i++) {
//             if (trigger[i].test(contentLower)) {
//                 triggered = true;
//                 break;
//             }
//         }
//     }

//     if (triggered) {
//         Admin.addMute(guild, channel, speaker, 'System', { 'reason': 'Muted Themself' });
//     }
// });

/* exports.runFuncs.push((msgObj, speaker, channel, guild) => {
    if (guild == null || msgObj == null || speaker == null || speaker.user.bot === true || speaker.id === vaebId || speaker.id === guild.owner.id) return;

    let contentLower = msgObj.content.toLowerCase();
    contentLower = contentLower.replace(/<[^ ]*?[:#@][^ ]*?>/gm, '');
    contentLower = Util.replaceAll(contentLower, ' ', '');
    contentLower = Util.replaceAll(contentLower, 'one', '1');
    contentLower = Util.replaceAll(contentLower, 'won', '1');
    contentLower = Util.replaceAll(contentLower, 'uno', '1');
    contentLower = Util.replaceAll(contentLower, 'una', '1');
    contentLower = Util.replaceAll(contentLower, 'two', '2');
    contentLower = Util.replaceAll(contentLower, 'dose', '2');
    contentLower = Util.replaceAll(contentLower, 'dos', '2');
    contentLower = Util.replaceAll(contentLower, 'too', '2');
    contentLower = Util.replaceAll(contentLower, 'to', '2');
    contentLower = Util.replaceAll(contentLower, 'three', '3');
    contentLower = Util.replaceAll(contentLower, 'tres', '3');
    contentLower = Util.replaceAll(contentLower, 'free', '3');

    let triggered = false;

    const trigger = [/1\W*2\W*3\d/g];

    for (let i = 0; i < trigger.length; i++) {
        if (trigger[i].test(contentLower)) {
            triggered = true;
            break;
        }
    }

    if (triggered) {
        Admin.addBan(guild, channel, speaker, 'System', { time: null, reason: 'Banned Themself', temp: true });
    }
}); */

// exports.runFuncs.push((msgObj, speaker, channel, guild) => {
//     if (guild == null || msgObj == null || speaker == null || speaker.user.bot === true || speaker.id === vaebId) return;

//     let contentLower = msgObj.content.toLowerCase();
//     contentLower = contentLower.replace(/\s/g, '');
//     contentLower = contentLower.replace(/which/g, 'what');
//     contentLower = contentLower.replace(/great/g, 'best');
//     contentLower = contentLower.replace(/finest/g, 'best');
//     contentLower = contentLower.replace(/perfect/g, 'best');
//     contentLower = contentLower.replace(/top/g, 'best');
//     contentLower = contentLower.replace(/hack/g, 'exploit');
//     contentLower = contentLower.replace(/h\Sx/g, 'exploit');
//     contentLower = contentLower.replace(/le?v\S?l(?:\d|s|f)/g, 'exploit');

//     let triggered = 0;

//     const trigger = [/wh?[au]t/g, /b\S?st/g, /explo\S?t/g];
//     for (let i = 0; i < trigger.length; i++) {
//         if (trigger[i].test(contentLower)) triggered++;
//     }

//     if (triggered == trigger.length) {
//         Admin.addMute(guild, channel, speaker, 'System', { time: 1800000, reason: '[Auto-Mute] Asking stupid questions' });
//     }
// });

exports.runFuncs.push((msgObj, speaker, channel, guild) => {
    if (guild == null || msgObj == null || speaker == null || speaker.user.bot === true) return;

    let contentLower = msgObj.content.toLowerCase();
    // contentLower = contentLower.replace(/\s/g, '');
    contentLower = contentLower.replace(/w[au@]t/g, 'what');
    contentLower = contentLower.replace(/h[o0]w/g, 'what');
    contentLower = contentLower.replace(/my/g, 'what');
    contentLower = contentLower.replace(/m[a@]h/g, 'what');
    contentLower = contentLower.replace(/wh[e3]r[e3]/g, 'what');
    contentLower = contentLower.replace(/f[i1]nd/g, 'what');
    contentLower = contentLower.replace(/see/g, 'what');
    contentLower = contentLower.replace(/ c /g, 'what');
    contentLower = contentLower.replace(/ple{1,2}a?[sz]e/g, 'what');
    contentLower = contentLower.replace(/pl[eoyi]?[szx]/g, 'what');

    let triggered = 0;

    const trigger = [/d[eouyi]?s?[ck]{1,2}s?w?[ouey]r{0,2}[dt ]/g, / id|id /g, /what/g];
    for (let i = 0; i < trigger.length; i++) {
        if (trigger[i].test(contentLower)) triggered++;
    }

    if (triggered == trigger.length) {
        Util.sendDescEmbed(channel, Util.getMostName(speaker), `Your Discord ID: ${speaker.id}`, null, null, colGreen);
    }
});

index.bannedLetters = [];
// index.bannedLetters = ['f', '𝓕', 'ғ', 'ƒ', '🇫', 'ꎇ', '₣', '𝐅', '🄵', '🅵', '𝔽', 'ｆ', 'ꜰ', 'ꊰ', '𝐟', '𝖋', 'Ⓕ', 'ʄ', '𝓯', '𝕗', 'Ŧ', '下', '𝙁', '千', '⒡', 'ɟ', '℉', 'ｷ', '𝔣', '𝐹', 'Ⅎ', 'ꟻ', 'ᶠ', '𝙵', 'ℱ', '𝔉', '𝗳', 'Ֆ', 'φ', 'এ', 'ফ', 'ᶂ', 'ᵮ', 'Ꝭ', 'ꞧ', '🅕', 'ꞙ', 'ꬵ', 'ꝭ', 'ꝷ', 'ﬀ', 'ꭍ', 'ﬁ', 'Ḟ', 'דּ', '~~r~~', '~~t~~'];

// index.bannedLetters.push('ᖴ');

// index.runFuncs.push((msgObj, speaker, channel, guild) => {
//     if (guild == null || msgObj == null || speaker == null || speaker.user.bot === true || guild.id !== '477270527535480834' || Util.hasRoleName(speaker, 'owner')) return;

//     const contentLower = msgObj.content.toLowerCase();

//     for (let i = 0; i < index.bannedLetters.length; i++) {
//         if (contentLower.includes(index.bannedLetters[i].toLowerCase()) || /~~.*[^\x00-\x7F].*~~/.test(contentLower)) {
//             msgObj.delete()
//                 .then(() => {
//                     // Util.print(speaker.user, 'Notice: Your message has been deleted because the letter `F` is now banned.');
//                 })
//                 .catch(console.error);
//             Util.print(channel, `${speaker} Your message has been deleted because the letter \`F\` is now banned.`);
//             break;
//         }
//     }
// });

// index.runFuncs.push((msgObj, speaker, channel, guild) => {
//     if (guild == null || msgObj == null || speaker == null || speaker.user.bot === true || guild.id !== '477270527535480834' || Util.hasRoleName(speaker, 'owner')) return;

//     const contentLower = msgObj.content.toLowerCase();

//     for (let i = 0; i < index.bannedLetters.length; i++) {
//         if (/[^\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~vaeb\s0123456789]/i.test(contentLower)) {
//             msgObj.delete()
//                 .then(() => {
//                     // Util.print(speaker.user, 'Notice: Your message has been deleted because the letter `F` is now banned.');
//                 })
//                 .catch(console.error);
//             Util.print(channel, `${speaker} Your message has been deleted because all letters besides \`V\`, \`A\`, \`E\` and \`B\` are now banned.`);
//             break;
//         }
//     }
// });

// client.on('guildMemberUpdate', (oldMember, member) => {
//     if (member.guild.id !== '477270527535480834') return;

//     const nickLower = member.nickname ? member.nickname.toLowerCase() : '';
//     const userLower = member.user.username;

//     for (let i = 0; i < index.bannedLetters.length; i++) {
//         if (nickLower.includes(index.bannedLetters[i].toLowerCase()) || (nickLower === '' && userLower.includes(index.bannedLetters[i].toLowerCase()))) {
//             member.setNickname('nope').catch(console.error);
//             break;
//         }
//     }
// });

index.runFuncs.push((msgObj, speaker, channel, guild) => {
    if (guild == null || msgObj == null || speaker == null || speaker.user.bot === true) return;

    const content = msgObj.content;
    const matches = /\b\/?r\/(\w+)/g.exec(content);

    if (matches && matches.length) {
        Util.print(channel, `https://www.reddit.com/r/${matches[1]}`);
    }
});

exports.runFuncs.push((msgObj, speaker, channel, guild) => {
    if (guild == null || msgObj == null || speaker == null || speaker.user.bot === true) return;

    let contentLower = msgObj.content.toLowerCase();
    // contentLower = contentLower.replace(/\s/g, '');
    contentLower = contentLower.replace(/w[au@]t/g, 'what');
    contentLower = contentLower.replace(/h[o0]w/g, 'what');
    contentLower = contentLower.replace(/my/g, 'what');
    contentLower = contentLower.replace(/m[a@]h/g, 'what');
    contentLower = contentLower.replace(/wh[e3]r[e3]/g, 'what');
    contentLower = contentLower.replace(/f[i1]nd/g, 'what');
    contentLower = contentLower.replace(/see/g, 'what');
    contentLower = contentLower.replace(/ c /g, 'what');
    contentLower = contentLower.replace(/ple{1,2}a?[sz]e/g, 'what');
    contentLower = contentLower.replace(/pl[eoyi]?[szx]/g, 'what');

    let triggered = 0;

    const trigger = [/[i1]n{1,2}v{1,2}[i1]t{1,2}[e3]|l[i1]nk/g, / v[aeyui]{1,3}l|what|d[eouyi]?s?[ck]{1,2}s?w?[ouey]r{0,2}[dt ]/g];
    for (let i = 0; i < trigger.length; i++) {
        if (trigger[i].test(contentLower)) triggered++; // Mother fuckin' triggered
    }

    if (triggered == trigger.length) {
        // Util.sendDescEmbed(channel, Util.getMostName(speaker), 'The invite link for Veil Discord is https://discord.gg/aVvcjDS', null, null, colGreen);
    } else {
        if (/[i1]n{1,2}v{1,2}[i1]t{1,2}[e3]\s*l[i1]nk/g.test(contentLower)) {
            // Util.sendDescEmbed(channel, Util.getMostName(speaker), 'The invite link for Veil Discord is https://discord.gg/aVvcjDS', null, null, colGreen);
        }
    }
});

exports.runFuncs.push((msgObj, speaker, channel, guild, isEdit) => {
    if (
        isEdit ||
        guild == null ||
        guild.id != '477270527535480834' ||
        msgObj == null ||
        speaker == null ||
        speaker.user.bot === true ||
        speaker.id === guild.owner.id
    ) {
        return;
    }

    let contentLower = msgObj.content.toLowerCase().trim();

    if (contentLower == '!buy') return;

    // contentLower = contentLower.replace(/\s/g, '');
    contentLower = contentLower.replace(/\bthe /g, '');
    contentLower = contentLower.replace(/\bit\b/g, 'veil');
    contentLower = contentLower.replace(/\bthis\b/g, 'veil');
    contentLower = contentLower.replace(/\bvel\b/g, 'veil');
    contentLower = contentLower.replace(/\bveli/g, 'veil');
    contentLower = contentLower.replace(/\bv[ie][ie]l/g, 'veil');
    contentLower = contentLower.replace(/hack\b/g, 'veil');
    contentLower = contentLower.replace(/\bh\Sx\b/g, 'veil');
    contentLower = contentLower.replace(/le?v\S?l.?(?:\d|s|f)/g, 'veil');
    contentLower = contentLower.replace(/explo\S?t\b/g, 'veil');
    contentLower = contentLower.replace(/\bpay\b/g, 'buy');
    // contentLower = contentLower.replace(/get/g, 'buy');
    contentLower = contentLower.replace(/get veil/g, 'buy');
    contentLower = contentLower.replace(/purchas.?/g, 'buy');

    let triggered = false;

    if (/\s/g.test(contentLower) && contentLower.substr(contentLower.length - 3, 3) == 'buy') {
        triggered = true;
    }

    if (!triggered) {
        let triggeredNum = 0;

        const trigger = [/buy\b/g, /veil/g];
        for (let i = 0; i < trigger.length; i++) {
            if (trigger[i].test(contentLower)) triggeredNum++;
        }

        if (triggeredNum == trigger.length) triggered = true;
    }

    if (triggered) {
        // Util.sendDescEmbed(channel, 'How To Buy', 'To buy veil send a message saying !buy', null, null, colGreen);
    }
});

function antiScam(msgObj, contentLower, speaker, channel, guild, isEdit, original) {
    if (speaker == null || msgObj == null || speaker.user.bot === true || speaker.id === vaebId) return false;

    if (original) {
        contentLower = contentLower.replace(/[\n\r]/g, ' ');
        contentLower = contentLower.replace(/0/g, 'o');
        contentLower = contentLower.replace(/1/g, 'i');
        contentLower = contentLower.replace(/3/g, 'e');
        contentLower = contentLower.replace(/4/g, 'a');
        contentLower = contentLower.replace(/5/g, 's');
        contentLower = contentLower.replace(/8/g, 'b');
        contentLower = contentLower.replace(/@/g, 'a');

        if (antiScam(msgObj, Util.reverse(contentLower), speaker, channel, guild, isEdit, false)) return true;
    }

    contentLower = contentLower.replace(/https?/g, '');
    contentLower = contentLower.replace(/www\./g, '');
    contentLower = contentLower.replace(/[^a-z .]+/g, '');
    contentLower = contentLower.replace(/dot/g, '.');
    // contentLower = contentLower.replace(/(.)\1+/g, '$1');
    contentLower = contentLower.replace(/ +/g, '');

    if (original) {
        if (antiScam(msgObj, Util.reverse(contentLower), speaker, channel, guild, isEdit, false)) return true;
    }

    if (guild.id == '166601083584643072') Util.logc('blockLink1', contentLower);

    let triggered = false;

    const trigger = [
        // Change: non letter/dot characters
        {
            regex: /steam([^.]+)\.com/, // steamscam.com
            allow: [/^(?:powered|community)$/g],
        },
        {
            regex: /[^.]+steam[^.]*\.com/, // scamsteam.com
            allow: [],
        },
        {
            regex: /bit\.ly/, // bit.ly
            allow: [],
            /* }, {
            regex: /goo\.gl/, // goo.gl
            allow: [], */
        },
        {
            regex: /tinyurl\.com/, // tinyurl.com
            allow: [],
        },
    ];

    for (let i = 0; i < trigger.length; i++) {
        let matches = trigger[i].regex.exec(contentLower);
        if (!matches) continue;
        if (guild.id == '166601083584643072') Util.logc('blockLink1', matches);
        const triggerAllow = trigger[i].allow;
        for (let j = 0; j < triggerAllow.length; j++) {
            if (original && triggerAllow[j].test(matches[j + 1])) {
                matches = null;
                break;
            }
        }
        if (!matches) continue;
        triggered = true;
        break;
    }

    if (triggered) {
        Admin.addMute(guild, channel, speaker, 'System', { time: 1800000, reason: '[Anti-Scam] Posting a suspicious link' });
        return true;
    }

    return false;
}

exports.runFuncs.push((msgObj, speaker, channel, guild, isEdit) => {
    if (guild && speaker && Util.checkStaff(guild, speaker)) return;
    antiScam(msgObj, msgObj.content.toLowerCase().trim(), speaker, channel, guild, isEdit, true);
});

exports.runFuncs.push((msgObj, speaker, channel, guild) => {
    if (
        speaker == null ||
        msgObj == null ||
        speaker.user.bot === true ||
        speaker.id === vaebId ||
        speaker.id === guild.owner.id ||
        Util.checkStaff(guild, speaker)
    ) {
        return false;
    }

    let contentLower = msgObj.content.toLowerCase();

    contentLower = contentLower.replace(/[\n\r]/g, ' '); // All newlines become spaces
    contentLower = contentLower.replace(/0/g, 'o');
    contentLower = contentLower.replace(/1/g, 'i');
    contentLower = contentLower.replace(/3/g, 'e');
    contentLower = contentLower.replace(/4/g, 'a');
    contentLower = contentLower.replace(/5/g, 's');
    contentLower = contentLower.replace(/8/g, 'b');
    contentLower = contentLower.replace(/@/g, 'a');
    contentLower = contentLower.replace(/https?(?::\/\/)?/g, ''); // http(s)// removed
    contentLower = contentLower.replace(/www\./g, ''); // www. removed
    contentLower = contentLower.replace(/[^a-z ./]+/g, ''); // Any characters that aren't letters, spaces or dots are removed
    contentLower = contentLower.replace(/dot/g, '.');
    // contentLower = contentLower.replace(/(.)\1+/g, '$1');
    // contentLower = contentLower.replace(/ +/g, ''); // All spaces removed

    let triggered = false;

    const trigger = [
        // Will only contain: Letters, spaces, forward-slashes and dots
        {
            regex: /d *i *(?:s *)?[ck] *(?:[^ ] *)?o *r *d *(?:\. *)?(?:g *g *|i *o *|m *e *|c *o *m *)\/ *([^. /]+)/, // https://discord.gg/XVeAZd6
            allow: [/^(?:aVvcjDS|7gPhEKv|roblox|bvS5gwY|rrX8bA|9PbETKC)$/gi], // Caps matter but just-in-case
        },
    ];

    for (let i = 0; i < trigger.length; i++) {
        let matches = trigger[i].regex.exec(contentLower);
        if (!matches) continue;
        if (guild.id == '166601083584643072') Util.logc('blockLink1', matches);
        const triggerAllow = trigger[i].allow;
        for (let j = 0; j < triggerAllow.length; j++) {
            if (triggerAllow[j].test(matches[j + 1])) {
                matches = null;
                break;
            }
        }
        if (!matches) continue;
        triggered = true;
        break;
    }

    if (triggered) {
        msgObj.delete().catch(console.error);
        Admin.addMute(guild, channel, speaker, 'System', { reason: '[Auto-Mute] Advertising Discord server' });
        return true;
    }

    return false;
});

const staffMessages = {};

const recentMs = 20000; // What's the maximum elapsed time to count a message as recent?
const recentMessages = []; // Messages sent in the last recentMs milliseconds
const numSimilarForSpam = 3;
const spamMessages = []; // Messages detected as spam in recentMessages stay here for limited period of time

// const msgStatus = {}; // Coming soon?

/* let lastTimeout = {
    timeout: null,
    stamp: 0,
}; */

client.on('message', (msgObj) => {
    const channel = msgObj.channel;
    if (channel.name === 'vaebot-log') return;
    const guild = msgObj.guild;
    let speaker = msgObj.member;
    let author = msgObj.author;
    let content = msgObj.content;
    const authorId = author.id;

    const isRaidMode = guild ? exports.raidMode[guild.id] : false;

    // const presentStamp = +new Date();

    // if (guild.id !== '166601083584643072') return;

    if (content.includes('That command is reserved for Fredboat administration')) {
        msgObj.delete();
        return;
    }

    if (content.substring(content.length - 5) === ' -del' && authorId === vaebId) {
        msgObj.delete();
        content = content.substring(0, content.length - 5);
    }

    let contentLower = content.toLowerCase();

    const isStaff = guild && speaker ? Util.checkStaff(guild, speaker) : authorId === vaebId;

    if (exports.blockedUsers[authorId]) {
        msgObj.delete();
        return;
    }

    if (!isStaff) {
        for (let i = 0; i < exports.blockedWords.length; i++) {
            if (contentLower.includes(exports.blockedWords[i].toLowerCase())) {
                msgObj.delete();
                return;
            }
        }
    }

    /* if (guild != null) {
        if (lastTimeout.timeout) clearTimeout(lastTimeout.timeout);
        if (presentStamp - lastTimeout.stamp > 1000 * 60 * 10) { // Hmmm, 10 minutes?
            lastTimeout.timeout = setTimeout(notifyOn, 1000 * 60 * 3, channel); // 3 minutes
            lastTimeout.stamp = presentStamp;
        }
    } */

    if (guild != null && contentLower.substr(0, 5) === 'sudo ' && authorId === vaebId) {
        author = Util.getUserById(selfId);
        speaker = Util.getMemberById(selfId, guild);
        content = content.substring(5);
        contentLower = content.toLowerCase();
    }

    if (exports.runFuncs.length > 0) {
        for (let i = 0; i < exports.runFuncs.length; i++) {
            exports.runFuncs[i](msgObj, speaker, channel, guild, false);
        }
    }

    if (guild != null && speaker != null) {
        if (!has.call(staffMessages, speaker.id)) staffMessages[speaker.id] = {};
    }

    if (
        guild != null &&
        channel.name.toLowerCase() !== 'bot-commands' &&
        author.bot === false &&
        content.length > 0 &&
        !contentLower.startsWith('$') &&
        author.id !== guild.owner.id &&
        author.id !== vaebId &&
        !Admin.checkMuted(guild, author.id)
    ) {
        const contentSpam = content.replace(/\|\|(.+?)\|\|/g, (match, p1) => p1);
        const contentSpamLower = contentSpam.toLowerCase();

        // If they are eligible for anti-spam checks
        if (!has.call(userStatus, authorId)) userStatus[authorId] = 0; // Initialise user status
        if (!has.call(messageStamps, authorId)) messageStamps[authorId] = []; // Initialise user message storage
        const nowStamps = messageStamps[authorId]; // Get user message storage
        const stamp = +new Date(); // Get current timestamp
        nowStamps.unshift({ stamp, message: contentSpamLower }); // Add current message data to the start ([0]) of the message storage

        if (
            !Admin.checkMuted(guild, author.id) &&
            contentSpamLower.length >= 5 &&
            contentSpamLower.substr(0, 1) != ';' &&
            contentSpamLower != 'ping' &&
            contentSpamLower != '!buy'
        ) {
            // >= 5
            let numSimilar = 0;
            const prevSpam = spamMessages.find(spamMsg => Util.similarStringsStrict(contentSpam, spamMsg.msg));
            for (let i = recentMessages.length - 1; i >= 0; i--) {
                const recentMsg = recentMessages[i];
                if (Util.similarStringsStrict(contentSpam, recentMsg.msg)) {
                    numSimilar++;
                } else if (stamp - recentMsg.stamp > recentMs) {
                    recentMessages.splice(i, 1);
                }
            }
            const nowCheck = numSimilarForSpam;
            if ((numSimilar >= nowCheck || prevSpam) && !contentSpamLower.includes('welcome')) {
                // Is spam
                if (prevSpam) {
                    // If message is similar to one previously detected as spam
                    prevSpam.initWarn = false;
                    prevSpam.numSince = 0;
                    Admin.addMute(guild, channel, speaker, 'System', { reason: '[Auto-Mute] Message-Specific Spamming' }); // Mute the user
                } else {
                    // If message was detected as spam based on similar recent messages
                    spamMessages.push({ msg: contentSpam, stamp, numSince: 0, initWarn: true }); // At some point remove spam messages with really old stamp?
                    Util.print(
                        channel,
                        `**Warning:** If users continue to send variants of "${contentSpam}", it will be treated as spam resulting in mutes`,
                    ); // Warn the user
                    // Maybe put all the users who've spammed the message on a warning?
                }
            } else {
                for (let i = spamMessages.length - 1; i >= 0; i--) {
                    // Remove old spam message checks
                    const oldSpam = spamMessages[i];
                    oldSpam.numSince++;
                    if (oldSpam.numSince >= 20) spamMessages.splice(i, 1); // Too old -> Remove
                }
            }
        }

        recentMessages.push({ msg: contentSpam, stamp });

        if (!Admin.checkMuted(guild, author.id) && Util.isSpam(contentSpam)) {
            // Check if the message contains single-message-spam
            if (userStatus[authorId] == 0) {
                // If the user has not yet been warned recently
                Util.logc('AntiSpam1', `[4] ${Util.getName(speaker)} warned`);
                Util.print(channel, speaker.toString(), 'Warning: If you continue to spam you will be auto-muted'); // Warn the user
                lastWarn[authorId] = stamp; // Record time of warning in case they get another one soon
                userStatus[authorId] = 2; // Set status to "monitoring for spam on high alert"
            } else {
                // If the user has already had a warning
                Util.logc('AntiSpam1', `[4] ${Util.getName(speaker)} muted`);
                Admin.addMute(guild, channel, speaker, 'System', { reason: '[Auto-Mute] Spamming' }); // Mute the user
                userStatus[authorId] = 0; // Reset their status to the default
            }
        }
        if (!Admin.checkMuted(guild, author.id) && userStatus[authorId] !== 1) {
            // If the user has not been muted in the single-message spam check and they are not currently being timeout-analysed for spam
            if (nowStamps.length > checkMessages) {
                // If the user has more than the number of messages to check stored
                nowStamps.splice(checkMessages, nowStamps.length - checkMessages); // Remove the oldest messages
            }
            if (nowStamps.length >= checkMessages) {
                // Continue if they have enough messages recorded to check for multi-message spam
                const oldStamp = nowStamps[checkMessages - 1].stamp; // Get the oldest message's timestamp
                const elapsed = (stamp - oldStamp) / 1000; // Get the time elapsed since then in seconds
                const grad1 = (checkMessages / elapsed) * 10; // Calculate the gradient (velocity) at which they sent messages
                let checkGrad1 = sameGrad; // Initialise the comparison gradient as the sensitive gradient for if all messages are the same
                const latestMsg = nowStamps[0].message; // Get the latest (current) message's content
                for (let i = 0; i < checkMessages; i++) {
                    // Go through all the recorded messages
                    if (!Util.similarStrings(nowStamps[i].message, latestMsg)) {
                        // If all the content is *not* the same
                        checkGrad1 = warnGrad; // Use the normal comparison gradient
                        break;
                    }
                }
                // Util.log("User: " + Util.getName(speaker) + " | Elapsed Since " + checkMessages + " Messages: " + elapsed + " | Gradient1: " + grad1);
                if (grad1 >= checkGrad1) {
                    // If the current gradient (velocity) is higher than the comparison gradient
                    if (userStatus[authorId] === 0) {
                        // If the user hasn't been warned recently
                        Util.logc('AntiSpam1', `[1] ${Util.getName(speaker)} warned, gradient ${grad1} larger than ${checkGrad1}`);
                        userStatus[authorId] = 1; // Set status to "analysing their future messages"
                        Util.print(channel, speaker.toString(), 'Warning: If you continue to spam you will be auto-muted');
                        setTimeout(() => {
                            // Set a timeout for if they haven't seen the warning message yet (not using await due to ratelimtis in raids)
                            const lastStamp = nowStamps[0].stamp; // Get the timestamp of the latest message
                            setTimeout(() => {
                                // Continue storing all their messages for monitoring until this timer ends
                                if (Admin.checkMuted(guild, author.id)) {
                                    // If they've been muted during this time cancel the analysis here
                                    Util.logc('AntiSpam1', `[2] ${Util.getName(speaker)} is already muted`);
                                    userStatus[authorId] = 0; // Reset status to default
                                    return; // Cancel
                                }
                                let numNew = 0; // Declare var for counting new messages
                                let checkGrad2 = sameGrad; // Initialise the comparison gradient as the sensitive gradient for if all messages are the same
                                const newStamp = +new Date(); // Get the new current timestamp
                                const latestMsg2 = nowStamps[0].message; // Get the most recent message's content
                                // var origStamp2;
                                for (let i = 0; i < nowStamps.length; i++) {
                                    // For each new message from latest
                                    const curStamp = nowStamps[i];
                                    const isFinal = curStamp.stamp === lastStamp; // Is it the oldest (excluded) message
                                    if (isFinal && stamp === lastStamp) break; // If so and the oldest message was also the original message (no new messages) then break
                                    numNew++; // Increase total message count
                                    // origStamp2 = curStamp.stamp;
                                    if (!Util.similarStrings(curStamp.message, latestMsg2)) checkGrad2 = muteGrad; // If messages are not the same use nkrmal gradient
                                    if (isFinal) break; // If it was the final message to check then break
                                }
                                if (numNew == 0) {
                                    // If they haven't sent any new messages
                                    // Util.logc('AntiSpam1', `[2_] ${Util.getName(speaker)} stopped spamming and was put on alert`);
                                    lastWarn[authorId] = newStamp; // Store the stamp for their last warning
                                    userStatus[authorId] = 2; // Set status to monitoring on high alert
                                    return; // Cancel
                                }
                                // let numNew2 = 0; // New var for counting messages
                                // let elapsed2 = 0;
                                let grad2 = 0;
                                // var elapsed2 = (newStamp-origStamp2)/1000;
                                // var grad2 = (numNew/elapsed2)*10;
                                for (let i = 2; i < numNew; i++) {
                                    // They must have sent at least 2 messages
                                    const curStamp = nowStamps[i].stamp; // Get now message time
                                    const nowElapsed = (newStamp - curStamp) / 1000; // Get time elapsed between the message and now
                                    const nowGradient = ((i + 1) / nowElapsed) * 10; // Calculate gradient for message sending velocity over the time since this message
                                    if (nowGradient > grad2) {
                                        // If now gradient is larger than highest record gradient
                                        grad2 = nowGradient; // Set gradient as highest recorded
                                        // elapsed2 = nowElapsed; // Set elapsed as elapsed time between this message and now
                                        // numNew2 = i + 1; // Set number of new messages as i+1
                                    }
                                }
                                // Util.logc(
                                //     'AntiSpam1',
                                //     `[2] User: ${Util.getName(
                                //         speaker,
                                //     )} | Messages Since ${elapsed2} Seconds: ${numNew2} | Gradient2: ${grad2}`,
                                // );
                                if (grad2 >= checkGrad2) {
                                    // If gradient (velocity) is higher than checking gradient
                                    Util.logc(
                                        'AntiSpam1',
                                        `[2] ${Util.getName(speaker)} muted, gradient ${grad2} larger than ${checkGrad2}`,
                                    );
                                    Admin.addMute(guild, channel, speaker, 'System', { reason: '[Auto-Mute] Spamming' }); // Mute user
                                    userStatus[authorId] = 0; // Reset monitoring status to normal
                                } else {
                                    // Util.logc('AntiSpam1', `[2] ${Util.getName(speaker)} was put on alert`);
                                    lastWarn[authorId] = newStamp; // Store the stamp for their last warning
                                    userStatus[authorId] = 2; // Set status to monitoring on high alert
                                }
                            }, waitTime * 1000);
                        }, 350);
                    } else if (userStatus[authorId] === 2) {
                        // If the user has already been warned recently
                        Util.logc('AntiSpam1', `[3] ${Util.getName(speaker)} muted, repeated warns`);
                        Admin.addMute(guild, channel, speaker, 'System', { reason: '[Auto-Mute] Spamming' }); // Mute the user for multiple warnings in a short period of time
                        userStatus[authorId] = 0; // Reset user monitoring status to default
                    }
                } else if (userStatus[authorId] === 2 && stamp - lastWarn[authorId] > endAlert * 1000) {
                    // If it's been longer than the necessary monitoring time since their last warning
                    // Util.logc('AntiSpam1', `[3] ${Util.getName(speaker)} ended their alert`);
                    userStatus[authorId] = 0; // Deem the user safe and reset their monitoring status to normal
                }
            }
        }
    }

    if (guild != null) {
        if (Music.guildQueue[guild.id] == null) Music.guildQueue[guild.id] = [];

        if (Music.guildMusicInfo[guild.id] == null) {
            Music.guildMusicInfo[guild.id] = {
                activeSong: null,
                activeAuthor: null,
                voteSkips: [],
                isAuto: false,
            };
        }
    }

    if (guild && exports.slowChat[guild.id] && author.bot === false && !isStaff) {
        const nowTime = +new Date();
        if (nowTime > exports.chatNext[guild.id]) {
            exports.chatNext[guild.id] = nowTime + exports.calmSpeed;
        } else {
            msgObj.delete().catch(console.error);
            const intervalNum = exports.calmSpeed / 1000;
            // var timeUntilSend = (exports.chatNext[guild.id] - nowTime) / 1000;
            author
                .send(
                    `Your message has been deleted. ${
                        guild.name
                    } is temporarily in slow mode, meaning everyone must wait ${intervalNum} seconds 
            after the previous message before they can send one.`,
                )
                .catch(console.error);
        }
        // exports.chatQueue[guild.id].push(msgObj);
    }

    if (!isRaidMode || isStaff) {
        Cmds.checkMessage(msgObj, speaker || author, channel, guild, content, contentLower, authorId, isStaff);

        if (author.bot === true) {
            // RETURN IF BOT
            return;
        }

        Events.emit(guild, 'MessageCreate', speaker, channel, msgObj, content);

        // if (contentLower.includes('👀'.toLowerCase())) Util.print(channel, '👀');
    }
});

// //////////////////////////////////////////////////////////////////////////////////////////////

Util.log('-CONNECTING-');

client.login(Auth.discordToken);
