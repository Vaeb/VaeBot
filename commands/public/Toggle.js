module.exports = Cmds.addCommand({
	cmds: [";toggle "],

	requires: {
		guild: true,
		loud: false
	},

	desc: "Toggle an autorole on the speaker",

	args: "([auto_role_name])",

	example: "anime",

	///////////////////////////////////////////////////////////////////////////////////////////

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		var prop = args.toLowerCase();
		var guildAutoRoles = Data.guildGet(guild, Data.autoRoles);
		if (!guildAutoRoles.hasOwnProperty(prop)) {
			Util.commandFailed(channel, speaker, "AutoRole not found");
			return;
		}
		var roleName = guildAutoRoles[prop];
		var roleObj = Util.getRole(roleName, guild);
		if (!Util.hasRole(speaker, roleObj)) {
			speaker.addRole(roleObj);
			let sendEmbedFields = [
				{name: "Role Name", value: roleObj.name}
			];
			Util.sendEmbed(channel, "AutoRole Added", null, Util.makeEmbedFooter(speaker), Util.getAvatar(speaker), 0x00E676, sendEmbedFields);
		} else {
			speaker.removeRole(roleObj);
			let sendEmbedFields = [
				{name: "Role Name", value: roleObj.name}
			];
			Util.sendEmbed(channel, "AutoRole Removed", null, Util.makeEmbedFooter(speaker), Util.getAvatar(speaker), 0x00E676, sendEmbedFields);
		}
	}
});