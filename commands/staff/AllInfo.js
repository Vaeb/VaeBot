module.exports = Cmds.addCommand({
	cmds: [";allinfo"],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Get guild, role, channel and permission info in one huge set of messages",

	args: "",

	example: "",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		var outStr = ["**Guild info:**\n```"];
		outStr.push("ID: " + guild.id);
		outStr.push("Name: " + guild.name);
		outStr.push("Owner: " + Util.getName(guild.owner) + " (" + guild.ownerID + ")");
		outStr.push("Icon: " + guild.iconURL);
		outStr.push("Splash: " + guild.splashURL);
		outStr.push("Emojis: " + (guild.emojis.length > 0 ? JSON.stringify(guild.emojis) : "null"));
		outStr.push("AFK timeout: " + guild.afkTimeout + " seconds");
		outStr.push("Region: " + guild.region);
		outStr.push("Member count: " + guild.memberCount);
		outStr.push("Created: " + guild.createdAt);
		outStr.push("Main channel: " + guild.defaultChannel.name + " (" + guild.defaultChannel.id + ")");
		outStr.push("```");
		outStr.push("**Guild text channels:**\n```");
		Util.getTextChannels(guild).forEach(function(value, index, self) {
			outStr.push("Channel: " + value.name + " (" + value.id + ") | Topic: " + value.topic + " | Position: " + value.position + " | Created: " + value.createdAt);
		});
		outStr.push("```");
		outStr.push("**Guild voice channels:**\n```");
		Util.getVoiceChannels(guild).forEach(function(value, index, self) {
			outStr.push("Channel: " + value.name + " (" + value.id + ") | Topic: " + value.topic + " | Position: " + value.position + " | Created: " + value.createdAt + " | Bitrate: " + value.bitrate);
		});
		outStr.push("```");
		outStr.push("**Guild roles:**\n```");
		guild.roles.forEach(function(value, index, self) {
			outStr.push("Role: " + value.name + " (" + value.id + ") | Position: " + value.position + " | Mentionable: " + value.mentionable  + " | Color: " + value.color);
		});
		outStr.push("```");
		outStr.push("**Guild permissions:**\n```");
		guild.roles.forEach(function(value, index, self) {
			outStr.push("Role: " + value.name + " (" + value.id + ")");
			outStr.push(JSON.stringify(value.permissions));
			outStr.push("");
		});
		outStr.push("```");
		Util.print(channel, outStr.join("\n"));
	}
});