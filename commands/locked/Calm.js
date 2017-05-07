module.exports = Cmds.addCommand({
	cmds: [";calm", ";calmchat", ";slow", ";slowchat"],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Slows down chat speed",

	args: "",

	example: "",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		if (index.slowChat) return;

		index.slowChat = true;

		index.slowInterval = setInterval(function() {
			var msgObj = (index.chatQueue.splice(0, 1))[0];

			var channel = msgObj.channel;
			var guild = msgObj.guild;
			var speaker = msgObj.member;
			var content = msgObj.content;
			var createdAt = msgObj.createdAt;

			Util.sendEmbed(channell, Util.getMostName(speaker), content, Util.makeEmbedFooter(speaker, createdAt), null, 0x00E676, null);
		}, 3000);
	}
});
