module.exports = Cmds.addCommand({
	cmds: [";history"],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Get all users with mute history",

	args: "",

	example: "",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		//var botUser = Util.getMemberById(selfId, guild);

		var sendEmbedFields = [];

		var historyGuild = Data.guildGet(guild, Data.history);

		var numElements = 0;
		var numFound = 0;

		for (let targetId in historyGuild) {
			if (historyGuild.hasOwnProperty(targetId)) ++numElements;
		}

		var nowTime = Mutes.defaultMuteTime;
		var iterations = 0;

		while (numFound < numElements) {
			var nowFound = [];

			//console.log(numFound + "_" + numElements + "NOW: " + nowTime);

			for (let targetId in historyGuild) {
				if (historyGuild.hasOwnProperty(targetId)) {
					var userName = historyGuild[targetId][1];
					var userTime = historyGuild[targetId][0];

					//console.log(userTime);

					if (userTime == nowTime) {
						++numFound;
						var targMention = "<@" + targetId + ">";
						nowFound.push(targMention);
					}
				}
			}

			if (nowFound.length > 0) {
				var timeStr = Util.historyToString(nowTime);
				var nowValue = "​\n" + nowFound.join("\n\n\n") + "\n​";
				sendEmbedFields.push({name: timeStr, value: nowValue, inline: false});
			}

			nowTime = nowTime*2;
			++iterations;
			if (iterations > 100) {
				Util.print(channel, "[ERROR] History formatting timed out");
				return;
			}
		}
		
		Util.sendEmbed(channel, "Mute History", null, Util.makeEmbedFooter(speaker), null, 0x00BCD4, sendEmbedFields);
	}
});
