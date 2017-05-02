console.log("-STARTING-\n");

////////////////////////////////////////////////////////////////////////////////////////////////

var loadedData = [];
exports.loadedData = loadedData;

////////////////////////////////////////////////////////////////////////////////////////////////

const Util = require("./Util.js");

global.Util = Util;

const Discord = require("discord.js"),
	ManageData = require("./data/ManageData.js"),
	ManageMutes = require("./core/ManageMutes.js"),
	Auth = require("./Auth.js");

const client = new Discord.Client({
	disabledEvents: ["TYPING_START"],
	fetchAllMembers: true,
	disableEveryone: true
});

global.Discord = Discord;
global.client = client;

////////////////////////////////////////////////////////////////////////////////////////////////


var dailyMutes = [];
var dailyKicks = [];
var dailyBans = [];
exports.dailyMutes = dailyMutes;
exports.dailyKicks = dailyKicks;
exports.dailyBans = dailyBans;

var briefHour = 2;
var msToHours = 1/(1000*60*60);
var dayMS = 24/msToHours;
var madeBriefing = false;

var muted;

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

			if (dailyMutes.length > 0) {
				let dataValues = [];

				for (let i = 0; i < dailyMutes.length; i++) {
					let nowData = dailyMutes[i];
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

			if (dailyKicks.length > 0) {
				let dataValues = [];

				for (let i = 0; i < dailyKicks.length; i++) {
					let nowData = dailyKicks[i];
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

			if (dailyBans.length > 0) {
				let dataValues = [];

				for (let i = 0; i < dailyBans.length; i++) {
					let nowData = dailyBans[i];
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

			if (dailyMutes.length > 0 || dailyKicks.length > 0 || dailyBans.length > 0) {
				channel.send(undefined, {embed: embObj})
				.catch(error => console.log("\n[E_SendBriefing] " + error));
			}

			dailyMutes = []; // Reset
			dailyKicks = [];
			dailyBans = [];

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

////////////////////////////////////////////////////////////////////////////////////////////////

client.login(Auth.token);

process.on("unhandledRejection", err => {
	console.error("Uncaught Promise Error: \n" + err.stack);
});