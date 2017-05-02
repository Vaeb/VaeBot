console.log("-STARTING-\n");

////////////////////////////////////////////////////////////////////////////////////////////////

var loadedData = [];
exports.loadedData = loadedData;

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

global.client = new Discord.Client({
	disabledEvents: ["TYPING_START"],
	fetchAllMembers: true,
	disableEveryone: true
});

////////////////////////////////////////////////////////////////////////////////////////////////

exports.dailyMutes = [];
exports.dailyKicks = [];
exports.dailyBans = [];

var briefHour = 2;
const msToHours = 1/(1000*60*60);
const dayMS = 24/msToHours;
var madeBriefing = false;

const colAction = 0xF44336; // Log of action, e.g. action from within command
const colUser = 0x4CAF50; // Log of member change
const colMessage = 0xFFEB3B; // Log of message change
const colCommand = 0x2196F3; // Log of command being executed

const spamChannels = {
	"168744003741810688": true
};

const quietChannels = {
	"284746138995785729": true,
	"289447389251502080": true,
	"285040042001432577": true,
	"284746888715042818": true,
	"294244239485829122": true,
	"290228574273798146": true
};

var blockedUsers = {};

var runFuncs = [];


////////////////////////////////////////////////////////////////////////////////////////////////

Discord.GuildMember.prototype.getProp = function(p) {
	if (this[p] != null) return this[p];
	return this.user[p];
};

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
					if (userReason !== null && userReason.trim().length > 0) {
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
					if (userReason !== null && userReason.trim().length > 0) {
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
					if (userReason !== null && userReason.trim().length > 0) {
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

////////////////////////////////////////////////////////////////////////////////////////////////

client.on("ready", () => {
	console.log(`Connected as ${client.user.username}!`);

	if (madeBriefing === false) {
		madeBriefing = true;
		setBriefing();
	}
});

client.on("disconnect", closeEvent => {
	console.log("DISCONNECTED");
	console.log(closeEvent);
	console.log("Code: " + closeEvent.code);
	console.log("Reason: " + closeEvent.reason);
	console.log("Clean: " + closeEvent.wasClean);
});

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

	if (blockedUsers[authorId]) {
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
		for (var i = 0; i < runFuncs.length; i++) {
			runFuncs[i](msgObj, channel, speaker);
		}
	}

	Cmds.checkMessage(msgObj, speaker, channel, guild, content, lcontent, authorId, isStaff);

	if (author.bot === true) { //RETURN IF BOT
		return;
	}

	if (lcontent.includes(("👀").toLowerCase())) Util.print(channel, "👀");
});

////////////////////////////////////////////////////////////////////////////////////////////////

client.login(Auth.token);

process.on("unhandledRejection", err => {
	console.error("Uncaught Promise Error: \n" + err.stack);
});