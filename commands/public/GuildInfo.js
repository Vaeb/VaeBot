module.exports = Cmds.addCommand({
	cmds: [";ginfo", ";guildinfo"],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Get guild info",

	args: "",

	example: "",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		var createdStr = Util.getDateString(guild.createdAt);

		var sendEmbedFields = [];

		sendEmbedFields.push({name: "ID", value: guild.id});
		sendEmbedFields.push({name: "Name", value: guild.name});
		sendEmbedFields.push({name: "Owner", value: guild.owner.toString()});
		sendEmbedFields.push({name: "Region", value: Util.capitalize(guild.region)});
		sendEmbedFields.push({name: "Members", value: guild.memberCount});
		sendEmbedFields.push({name: "Text Channels", value: Util.getTextChannels(guild).size});
		sendEmbedFields.push({name: "Voice Channels", value: Util.getVoiceChannels(guild).size});
		sendEmbedFields.push({name: "Roles", value: guild.roles.size});
		sendEmbedFields.push({name: "Default Channel", value: Util.capitalize(guild.defaultChannel.name)});
		sendEmbedFields.push({name: "AFK Timeout", value: guild.afkTimeout + " seconds"});
		sendEmbedFields.push({name: "Created", value: createdStr});
		sendEmbedFields.push({name: "Icon", value: guild.iconURL});

		sendEmbedFields.sort(function(a, b) {
			return (String(a.name.length) + String(a.value.length)) - (String(b.name.length) + String(b.value.length));
		});
		
		Util.sendEmbed(channel, "Guild Info", null, Util.makeEmbedFooter(speaker), guild.iconURL, 0x00E676, sendEmbedFields);
	}
});