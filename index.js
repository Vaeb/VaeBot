console.log("\n-STARTING-\n");

////////////////////////////////////////////////////////////////////////////////////////////////

exports.FileSys = require("fs");
exports.DateFormat = require("dateformat");
exports.Request = require("request");
exports.Urban = require("urban");
exports.Ytdl = require("ytdl-core");
exports.Path = require("path");
const YtInfoObj = require("youtube-node");
exports.YtInfo = new YtInfoObj();

////////////////////////////////////////////////////////////////////////////////////////////////

global.index = module.exports;

global.selfId = "224529399003742210";
global.vaebId = "107593015014486016";

global.Util = require("./Util.js");
global.Data = require("./data/ManageData.js");
global.Mutes = require("./core/ManageMutes.js");
global.Music = require("./core/ManageMusic.js");
global.Cmds = require("./core/ManageCommands.js");
global.Discord = require("discord.js");

const Auth = require("./Auth.js");

exports.YtInfo.setKey(Auth.youtube);

Discord.GuildMember.prototype.getProp = function(p) {
	if (this[p] != null) return this[p];
	return this.user[p];
};

Discord.User.prototype.getProp = function(p) {
	return this[p];
};

global.client = new Discord.Client({
	disabledEvents: ["TYPING_START"],
	fetchAllMembers: true,
	disableEveryone: true
});

////////////////////////////////////////////////////////////////////////////////////////////////

exports.dailyMutes = [];
exports.dailyKicks = [];
exports.dailyBans = [];

exports.commandTypes = {
	locked: "vaeb",
	staff: "staff",
	public: "null"
};

var briefHour = 2;
const msToHours = 1/(1000*60*60);
const dayMS = 24/msToHours;
var madeBriefing = false;

global.colAction = 0xF44336; // Log of action, e.g. action from within command
global.colUser = 0x4CAF50; // Log of member change
global.colMessage = 0xFFEB3B; // Log of message change
global.colCommand = 0x2196F3; // Log of command being executed

exports.blockedUsers = {};
exports.blockedWords = [];

var runFuncs = [];

////////////////////////////////////////////////////////////////////////////////////////////////

function setBriefing() {
	client.setTimeout(function() {
		var time1 = new Date();
		var time2 = new Date();

		time2.setHours(briefHour);
		time2.setMinutes(0);
		time2.setSeconds(0);
		time2.setMilliseconds(0);

		var t1 = + time1;
		var t2 = + time2;
		var t3 = t2 - t1;
		if (t3 < 0) t3 = t3 + dayMS;

		var channel = client.channels.get("168744024931434498");
		var guild = channel.guild;

		console.log("Set daily briefing for " + t3*msToHours + " hours");

		client.setTimeout(function() {
			var upField = {name: "​", value: "​", inline: false};
			var muteField = {name: "Mutes", value: "No mutes today", inline: false};
			//var rightField = {name: "​", value: "​"}
			var kickField = {name: "Kicks", value: "No kicks today", inline: false};
			var banField = {name: "Bans", value: "No bans today", inline: false};

			var embFields = [muteField, kickField, banField];

			var embObj = {
				title: "Daily Briefing",
				description: "​",
				fields: embFields,
				footer: {text: ">> More info in #vaebot-log <<"},
				thumbnail: {url: "./resources/avatar.png"},
				color: 0x00E676
			};

			if (exports.dailyMutes.length > 0) {
				let dataValues = [];

				for (let i = 0; i < exports.dailyMutes.length; i++) {
					let nowData = exports.dailyMutes[i];
					let userId = nowData[0];
					let userName = safe(nowData[1]);
					let userReason = safe(nowData[2]);
					let userTime = nowData[3];
					let targMention = "<@" + userId + ">";
					let reasonStr = "";
					if (userReason != null && userReason.trim().length > 0) {
						reasonStr = " : " + userReason;
					}
					dataValues.push(targMention + reasonStr);
				}

				muteField.value = dataValues.join("\n\n");
			}

			muteField.value = "​\n" + muteField.value + "\n​";

			if (exports.dailyKicks.length > 0) {
				let dataValues = [];

				for (let i = 0; i < exports.dailyKicks.length; i++) {
					let nowData = exports.dailyKicks[i];
					let userId = nowData[0];
					let userName = safe(nowData[1]);
					let userReason = safe(nowData[2]);
					let targMention = "<@" + userId + ">";
					let reasonStr = "";
					if (userReason != null && userReason.trim().length > 0) {
						reasonStr = " : " + userReason;
					}
					dataValues.push(targMention + reasonStr);
				}

				kickField.value = dataValues.join("\n\n");
			}

			kickField.value = "​\n" + kickField.value + "\n​";

			if (exports.dailyBans.length > 0) {
				let dataValues = [];

				for (let i = 0; i < exports.dailyBans.length; i++) {
					let nowData = exports.dailyBans[i];
					let userId = nowData[0];
					let userName = safe(nowData[1]);
					let userReason = safe(nowData[2]);
					let targMention = "<@" + userId + ">";
					let reasonStr = "";
					if (userReason != null && userReason.trim().length > 0) {
						reasonStr = " : " + userReason;
					}
					dataValues.push(targMention + reasonStr);
				}

				banField.value = dataValues.join("\n\n");
			}

			banField.value = "​\n" + banField.value + "\n​";

			if (exports.dailyMutes.length > 0 || exports.dailyKicks.length > 0 || exports.dailyBans.length > 0) {
				channel.send(undefined, {embed: embObj})
				.catch(error => console.log("\n[E_SendBriefing] " + error));
			}

			exports.dailyMutes = []; // Reset
			exports.dailyKicks = [];
			exports.dailyBans = [];

			setBriefing();
		}, t3);
	}, 2000); // Let's wait 2 seconds before starting countdown, just in case of floating point errors triggering multiple countdowns
}

function setupSecurity() {
	var veilGuild = client.guilds.get("284746138995785729");
	if (!veilGuild) return console.log("[ERROR_VP] Veil guild not found!");
	var newGuild = client.guilds.get("309785618932563968");
	if (!newGuild) return console.log("[ERROR_VP] New Veil guild not found!");
	var veilBuyer = veilGuild.roles.find("name", "Buyer");
	if (!veilBuyer) return console.log("[ERROR_VP] Veil Buyer role not found!");
	var newBuyer = newGuild.roles.find("name", "Buyer");
	if (!newBuyer) return console.log("[ERROR_VP] New Buyer role not found!");
	var sendRole = Util.getRole("SendMessages", guild);
	var guildName = newGuild.name;

	console.log("Setting up security");

	newGuild.members.forEach(member => {
		var memberId = member.id;
		var memberName = Util.getFullName(member);
		var veilMember = Util.getMemberById(memberId, veilGuild);
		if (!veilMember) {
			console.log("[Auto-Old-Kick 1] User not in Veil: " + memberName);
			member.kick()
			.catch(error => console.log("\n[E_AutoOldKick1] " + memberName + " | " + error));
			return;
		}
		if (!veilMember.roles.has(veilBuyer.id)) {
			console.log("[Auto-Old-Kick 2] User does not have Buyer role: " + memberName);
			member.kick()
			.catch(error => console.log("\n[E_AutoOldKick2] " + memberName + " | " + error));
			return;
		}
		if (!member.roles.has(newBuyer.id)) {
			member.addRole(newBuyer)
			.catch(error => console.log("\n[E_AutoOldAddRole1] " + memberName + " | " + error));
			console.log("Updated old member with Buyer role: " + memberName);
		}

		if (sendRole) {
			var isMuted = Mutes.checkMuted(memberId, guild);

			if (isMuted == true) {
				console.log("Muted user " + memberName + " had already joined " + guildName);
			} else {
				member.addRole(sendRole);
				console.log("Assigned SendMessages to old member " + memberName);
			}
		}
	});
}

////////////////////////////////////////////////////////////////////////////////////////////////

Cmds.initCommands();

client.on("ready", () => {
	console.log(`\nConnected as ${client.user.username}!`);

	Mutes.restartTimeouts();

	if (madeBriefing == false) {
		madeBriefing = true;
		setBriefing();
	}

	setupSecurity();
});

client.on("disconnect", closeEvent => {
	console.log("DISCONNECTED");
	console.log(closeEvent);
	console.log("Code: " + closeEvent.code);
	console.log("Reason: " + closeEvent.reason);
	console.log("Clean: " + closeEvent.wasClean);
});

client.on("guildMemberRemove", member => {
	var guild = member.guild;

	var sendLogData = [
		"User Left",
		guild,
		member,
		{name: "Username", value: member.toString()},
		{name: "Highest Role", value: member.highestRole.name}
	];

	Util.sendLog(sendLogData, colUser);
});

client.on("guildMemberAdd", member => {
	var guild = member.guild;

	var guildName = guild.name;
	var memberId = member.id;
	var memberName = Util.getFullName(member);

	console.log("User joined: " + memberName + " (" + memberId + ")" + " @ " + guildName);

	if (guild.id == "309785618932563968") {
		var veilGuild = client.guilds.get("284746138995785729");
		var veilBuyer = veilGuild.roles.find("name", "Buyer");
		var newBuyer = guild.roles.find("name", "Buyer");
		if (!veilGuild) {
			console.log("[ERROR_VP] Veil guild not found!");
		} else if (!veilBuyer) {
			console.log("[ERROR_VP] Veil Buyer role not found!");
		} else if (!newBuyer) {
			console.log("[ERROR_VP] New Buyer role not found!");
		} else {
			var veilMember = Util.getMemberById(memberId, veilGuild);
			if (!veilMember) {
				console.log("[Auto-Kick 1] User not in Veil: " + memberName);
				member.kick()
				.catch(error => console.log("\n[E_AutoKick1] " + error));
				return;
			}
			if (!veilMember.roles.has(veilBuyer.id)) {
				console.log("[Auto-Kick 2] User does not have Buyer role: " + memberName);
				member.kick()
				.catch(error => console.log("\n[E_AutoKick2] " + error));
				return;
			}
			member.addRole(newBuyer)
			.catch(error => console.log("\n[E_AutoAddRole1] " + error));
			console.log("Awarded new member with Buyer role");
		}
	}

	var isMuted = Mutes.checkMuted(memberId, guild);

	if (isMuted == true) {
		console.log("Muted user " + memberName + " joined " + guildName);
	} else {
		var sendRole = Util.getRole("SendMessages", guild);

		if (sendRole) {
			member.addRole(sendRole);
			console.log("Assigned SendMessages to new member " + memberName);
		}
	}

	//if (memberId == "208661173153824769") member.setNickname("<- weird person");
	//if (memberId == "264481367545479180") member.setNickname("devourer of penis");

	var sendLogData = [
		"User Joined",
		guild,
		member,
		{name: "Username", value: member.toString()}
	];

	Util.sendLog(sendLogData, colUser);
});

client.on("guildMemberUpdate", (oldMember, member) => {
	var guild = member.guild;
	var previousNick = oldMember.nickname;
	var nowNick = member.nickname;
	var oldRoles = oldMember.roles;
	var nowRoles = member.roles;

	var rolesAdded = nowRoles.filter(role => {
		return (!oldRoles.has(role.id));
	});

	var rolesRemoved = oldRoles.filter(role => {
		return (!nowRoles.has(role.id));
	});

	if (rolesAdded.size > 0) {
		rolesAdded.forEach((nowRole, roleId) => {
			if (member.id == "214047714059616257" && (nowRole.id == "293458258042159104" || nowRole.id == "284761589155102720")) {
				member.removeRole(nowRole);
			}
			if (nowRole.name == "SendMessages" && Mutes.checkMuted(member.id, guild)) {
				member.removeRole(nowRole);
				console.log("Force re-muted " + Util.getName(member) + " (" + member.id + ")");
			} else {
				var sendLogData = [
					"Role Added",
					guild,
					member,
					{name: "Username", value: member.toString()},
					{name: "Role Name", value: nowRole.name}
				];
				Util.sendLog(sendLogData, colUser);
			}
		});
	}

	if (rolesRemoved.size > 0) {
		rolesRemoved.forEach((nowRole, roleId) => {
			if (nowRole.name == "SendMessages" && Mutes.checkMuted(member.id, guild) == false) {
				member.addRole(nowRole);
				console.log("Force re-unmuted " + Util.getName(member) + " (" + member.id + ")");
			} else {
				var sendLogData = [
					"Role Removed",
					guild,
					member,
					{name: "Username", value: member.toString()},
					{name: "Role Name", value: nowRole.name}
				];
				Util.sendLog(sendLogData, colUser);
			}
		});
	}

	if (previousNick != nowNick) {
		//if (member.id == "208661173153824769" && nowNick != "<- weird person") member.setNickname("<- weird person");
		//if (member.id == "264481367545479180" && nowNick != "devourer of penis") member.setNickname("devourer of penis");
		// if (member.id == selfId && nowNick != null && nowNick != "") member.setNickname("");
		// if (member.id == vaebId && nowNick != null && nowNick != "") member.setNickname("");
		var sendLogData = [
			"Nickname Updated",
			guild,
			member,
			{name: "Username", value: member.toString()},
			{name: "Old Nickname", value: previousNick},
			{name: "New Nickname", value: nowNick}
		];
		Util.sendLog(sendLogData, colUser);
	}
});

client.on("messageUpdate", (oldMsgObj, newMsgObj) => {
	if (newMsgObj == null) return;
	var channel = newMsgObj.channel;
	if (channel.name == "vaebot-log") return;
	var guild = newMsgObj.guild;
	var speaker = newMsgObj.member;
	var author = newMsgObj.author;
	var content = newMsgObj.content;
	var lcontent = content.toLowerCase();
	var isStaff = author.id == vaebId;
	var msgId = newMsgObj.id;

	var oldContent = oldMsgObj.content;

	for (var i = 0; i < exports.blockedWords.length; i++) {
		if (lcontent.includes(exports.blockedWords[i].toLowerCase())) {
			newMsgObj.delete();
			return;
		}
	}

	if (oldContent != content) {
		var sendLogData = [
			"Message Updated",
			guild,
			author,
			{name: "Username", value: author.toString()},
			{name: "Channel Name", value: channel.toString()},
			{name: "Old Message", value: oldContent},
			{name: "New Message", value: content}
		];
		Util.sendLog(sendLogData, colMessage);
	}
});

exports.lockChannel = null;

client.on("voiceStateUpdate", (oldMember, member) => {
	var oldChannel = oldMember.voiceChannel; // May be null
	var newChannel = member.voiceChannel; // May be null

	var oldChannelId = oldChannel ? oldChannel.id : null;
	var newChannelId = newChannel ? newChannel.id : null;

	var guild = member.guild;

	if (member.id == selfId) {
		var member = Util.getMemberById(member.id, guild);

		if (member.serverMute) {
			member.setMute(false);
			console.log("Force removed server-mute from bot");
		}

		if (exports.lockChannel != null && oldChannelId == exports.lockChannel && newChannelId != exports.lockChannel) {
			console.log("Force re-joined locked channel");
			oldChannel.join();
		}
	}
});

client.on("messageDelete", msgObj => {
	if (msgObj == null) return;
	var channel = msgObj.channel;
	var guild = msgObj.guild;
	var speaker = msgObj.member;
	var author = msgObj.author;
	var content = msgObj.content;
	var lcontent = content.toLowerCase();
	var isStaff = author.id == vaebId;
	var msgId = msgObj.id;

	if (author.id == vaebId) return;

	var sendLogData = [
		"Message Deleted",
		guild,
		author,
		{name: "Username", value: author.toString()},
		{name: "Channel Name", value: channel.toString()},
		{name: "Message", value: content}
	];
	Util.sendLog(sendLogData, colMessage);
});

var messageStamps = {};
var userStatus = {};
var lastWarn = {};
var checkMessages = 5; // (n)
var warnGrad = 13.5; // Higher = More Spam (Messages per Second) | 10 = 1 message per second
var sameGrad = 4;
var muteGrad = 9;
var waitTime = 5.5;
var endAlert = 15;

client.on("message", msgObj => {
	var channel = msgObj.channel;
	if (channel.name == "vaebot-log") return;
	var guild = msgObj.guild;
	var speaker = msgObj.member;
	var author = msgObj.author;
	var content = msgObj.content;
	var authorId = author.id;

	if (content.substring(content.length-5) == " -del" && authorId == vaebId) {
		msgObj.delete();
		content = content.substring(0, content.length-5);
	}

	var lcontent = content.toLowerCase();

	var isStaff = (guild && speaker) ? isStaff = Util.checkStaff(guild, speaker) : authorId == vaebId;

	if (exports.blockedUsers[authorId]) {
		msgObj.delete();
		return;
	}

	if (guild != null && lcontent.substr(0, 5) == "sudo " && authorId == vaebId) {
		author = Util.getUserById(selfId);
		speaker = Util.getMemberById(selfId, guild);
		content = content.substring(5);
		lcontent = content.toLowerCase();
	} else if (speaker == null) {
		speaker = author;
	}

	if (runFuncs.length > 0) {
		for (let i = 0; i < runFuncs.length; i++) {
			runFuncs[i](msgObj, channel, speaker);
		}
	}

	if (guild != null && author.bot == false && author.bot == false) {
		if (!userStatus.hasOwnProperty(authorId)) userStatus[authorId] = 0;
		if (!messageStamps.hasOwnProperty(authorId)) messageStamps[authorId] = [];
		var nowStamps = messageStamps[authorId];
		var stamp = (+ new Date());
		nowStamps.unshift({stamp: stamp, message: lcontent});
		if (userStatus[authorId] != 1) {
			if (nowStamps.length > checkMessages) {
				nowStamps.splice(checkMessages, nowStamps.length-checkMessages);
			}
			if (nowStamps.length >= checkMessages) {
				var oldStamp = nowStamps[checkMessages-1].stamp;
				var elapsed = (stamp-oldStamp)/1000;
				var grad1 = (checkMessages/elapsed)*10;
				var checkGrad1 = sameGrad;
				var latestMsg = nowStamps[0].message;
				for (let i = 0; i < checkMessages; i++) {
					if (nowStamps[i].message != latestMsg) {
						checkGrad1 = warnGrad;
						break;
					}
				}
				// console.log("User: " + Util.getName(speaker) + " | Elapsed Since " + checkMessages + " Messages: " + elapsed + " | Gradient1: " + grad1);
				if (grad1 >= checkGrad1) {
					if (userStatus[authorId] == 0) {
						console.log(Util.getName(speaker) + " warned, gradient larger than " + checkGrad1);
						userStatus[authorId] = 1;
						Util.print(channel, speaker.toString(), "Warning: If you continue to spam you will be auto-muted");
						setTimeout(function() {
							var lastStamp = nowStamps[0].stamp;
							setTimeout(function() {
								var numNew = 0;
								var checkGrad2 = sameGrad;
								var newStamp = (+ new Date());
								var latestMsg2 = nowStamps[0].message;
								//var origStamp2;
								for (let i = 0; i < nowStamps.length; i++) {
									var curStamp = nowStamps[i];
									var isFinal = curStamp.stamp == lastStamp;
									if (isFinal && stamp == lastStamp) break;
									numNew++;
									//origStamp2 = curStamp.stamp;
									if (curStamp.message != latestMsg2) checkGrad2 = muteGrad;
									if (isFinal) break;
								}
								if (numNew == 0) {
									console.log("[2_] " + Util.getName(speaker) + " was put on alert");
									lastWarn[authorId] = newStamp;
									userStatus[authorId] = 2;
									return;
								}
								var numNew2 = 0;
								var elapsed2 = 0;
								var grad2 = 0;
								//var elapsed2 = (newStamp-origStamp2)/1000;
								//var grad2 = (numNew/elapsed2)*10;
								for (let i = 2; i < numNew; i++) {
									var curStamp = nowStamps[i].stamp;
									var nowElapsed = (newStamp-curStamp)/1000;
									var nowGradient = ((i+1)/nowElapsed)*10;
									if (nowGradient > grad2) {
										grad2 = nowGradient;
										elapsed2 = nowElapsed;
										numNew2 = i+1;
									}
								}
								console.log("[2] User: " + Util.getName(speaker) + " | Messages Since " + elapsed2 + " Seconds: " + numNew2 + " | Gradient2: " + grad2);
								if (grad2 >= checkGrad2) {
									console.log("[2] " + Util.getName(speaker) + " muted, gradient larger than " + checkGrad2);
									Mutes.doMuteReal(speaker, "[Auto-Mute] Spamming", guild, Infinity, channel, "System");
									userStatus[authorId] = 0;
								} else {
									console.log("[2] " + Util.getName(speaker) + " was put on alert");
									lastWarn[authorId] = newStamp;
									userStatus[authorId] = 2;
								}
							}, waitTime*1000);
						}, 350);
					} else if (userStatus[authorId] == 2) {
						console.log("[3] " + Util.getName(speaker) + " muted, repeated warns");
						Mutes.doMuteReal(speaker, "[Auto-Mute] Spamming", guild, Infinity, channel, "System");
						userStatus[authorId] = 0;
					}
				} else {
					if (userStatus[authorId] == 2 && (stamp-lastWarn[authorId]) > (endAlert*1000)) {
						console.log(Util.getName(speaker) + " ended their alert");
						userStatus[authorId] = 0;
					}
				}
			}
		}
	}

	if (guild != null) {
		if (Music.songs[guild.id] == null) Music.songs[guild.id] = [];

		if (Music.songData[guild.id] == null) {
			Music.songData[guild.id] = {
				nowVideo: null,
				nowAuthor: null,
				voteSkips: [],
				isAuto: false
			};
		}
	}

	Cmds.checkMessage(msgObj, speaker, channel, guild, content, lcontent, authorId, isStaff);

	if (author.bot == true) { //RETURN IF BOT
		return;
	}

	if (lcontent.includes(("👀").toLowerCase())) Util.print(channel, "👀");
});

////////////////////////////////////////////////////////////////////////////////////////////////

console.log("-CONNECTING-\n");

client.login(Auth.token);

process.on("unhandledRejection", err => {
	console.error("Uncaught Promise Error: \n" + err.stack);
});