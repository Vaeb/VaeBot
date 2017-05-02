/*

var (\w+?) = 
$1: 

[^}];
,

*/

module.exports = {
	selfId: "224529399003742210",
	vaebId: "107593015014486016",

	mutesDir: "./data/mutes.json",
	histDir: "./data/history.json",
	autoRoleDir: "./data/autoroles.json",
	playlistDir: "./data/playlist.json",

	rolePermissions: [
		"CREATE_INSTANT_INVITE",
		"KICK_MEMBERS",
		"BAN_MEMBERS",
		"VIEW_AUDIT_LOG",
		"ADMINISTRATOR",
		"MANAGE_CHANNELS",
		"MANAGE_GUILD",
		"ADD_REACTIONS", // add reactions to messages
		"READ_MESSAGES",
		"SEND_MESSAGES",
		"SEND_TTS_MESSAGES",
		"MANAGE_MESSAGES",
		"EMBED_LINKS",
		"ATTACH_FILES",
		"READ_MESSAGE_HISTORY",
		"MENTION_EVERYONE",
		"USE_EXTERNAL_EMOJIS", // use external emojis
		"CONNECT", // connect to voice
		"SPEAK", // speak on voice
		"MUTE_MEMBERS", // globally mute members on voice
		"DEAFEN_MEMBERS", // globally deafen members on voice
		"MOVE_MEMBERS", // move member's voice channels
		"USE_VAD", // use voice activity detection
		"CHANGE_NICKNAME",
		"MANAGE_NICKNAMES", // change nicknames of others
		"MANAGE_ROLES",
		"MANAGE_WEBHOOKS",
		"MANAGE_EMOJIS"
	],

	rolePermissionsObj: {
		"CREATE_INSTANT_INVITE": true,
		"KICK_MEMBERS": true,
		"BAN_MEMBERS": true,
		"VIEW_AUDIT_LOG": true,
		"ADMINISTRATOR": true,
		"MANAGE_CHANNELS": true,
		"MANAGE_GUILD": true,
		"ADD_REACTIONS": true, // add reactions to messages
		"READ_MESSAGES": true,
		"SEND_MESSAGES": true,
		"SEND_TTS_MESSAGES": true,
		"MANAGE_MESSAGES": true,
		"EMBED_LINKS": true,
		"ATTACH_FILES": true,
		"READ_MESSAGE_HISTORY": true,
		"MENTION_EVERYONE": true,
		"USE_EXTERNAL_EMOJIS": true, // use external emojis
		"CONNECT": true, // connect to voice
		"SPEAK": true, // speak on voice
		"MUTE_MEMBERS": true, // globally mute members on voice
		"DEAFEN_MEMBERS": true, // globally deafen members on voice
		"MOVE_MEMBERS": true, // move member's voice channels
		"USE_VAD": true, // use voice activity detection
		"CHANGE_NICKNAME": true,
		"MANAGE_NICKNAMES": true, // change nicknames of others
		"MANAGE_ROLES": true,
		"MANAGE_WEBHOOKS": true,
		"MANAGE_EMOJIS": true
	},

	textChannnelPermissions: [
		"CREATE_INSTANT_INVITE",
		"MANAGE_CHANNEL",
		"ADD_REACTIONS", // add reactions to messages
		"READ_MESSAGES",
		"SEND_MESSAGES",
		"SEND_TTS_MESSAGES",
		"MANAGE_MESSAGES",
		"EMBED_LINKS",
		"ATTACH_FILES",
		"READ_MESSAGE_HISTORY",
		"MENTION_EVERYONE",
		"USE_EXTERNAL_EMOJIS", // use external emojis
		"MANAGE_PERMISSIONS",
		"MANAGE_WEBHOOKS"
	],

	textChannnelPermissionsObj: {
		"ADD_REACTIONS": true, // add reactions to messages
		"READ_MESSAGES": true,
		"SEND_MESSAGES": true,
		"SEND_TTS_MESSAGES": true,
		"MANAGE_MESSAGES": true,
		"EMBED_LINKS": true,
		"ATTACH_FILES": true,
		"READ_MESSAGE_HISTORY": true,
		"MENTION_EVERYONE": true,
		"USE_EXTERNAL_EMOJIS": true, // use external emojis
		"CREATE_INSTANT_INVITE": true,
		"MANAGE_CHANNEL": true,
		"MANAGE_PERMISSIONS": true,
		"MANAGE_WEBHOOKS": true
	},

	voiceChannnelPermissions: [
		"CONNECT", // connect to voice
		"SPEAK", // speak on voice
		"MUTE_MEMBERS", // globally mute members on voice
		"DEAFEN_MEMBERS", // globally deafen members on voice
		"MOVE_MEMBERS", // move member's voice channels
		"USE_VAD", // use voice activity detection
		"CREATE_INSTANT_INVITE",
		"MANAGE_CHANNEL",
		"MANAGE_PERMISSIONS",
		"MANAGE_WEBHOOKS"
	],

	voiceChannnelPermissionsObj: {
		"CONNECT": true, // connect to voice
		"SPEAK": true, // speak on voice
		"MUTE_MEMBERS": true, // globally mute members on voice
		"DEAFEN_MEMBERS": true, // globally deafen members on voice
		"MOVE_MEMBERS": true, // move member's voice channels
		"USE_VAD": true, // use voice activity detection
		"CREATE_INSTANT_INVITE": true,
		"MANAGE_CHANNEL": true,
		"MANAGE_PERMISSIONS": true,
		"MANAGE_WEBHOOKS": true
	},

	permissionsOrder: {
		"ADMINISTRATOR": 27,
		"MANAGE_GUILD": 26,
		"MANAGE_ROLES": 25,
		"MANAGE_CHANNELS": 24,
		"MANAGE_CHANNEL": 24, // Channel
		"MANAGE_WEBHOOKS": 23,
		"MANAGE_EMOJIS": 22,
		"MANAGE_PERMISSIONS": 22, // Channel
		"VIEW_AUDIT_LOG": 21,
		"MENTION_EVERYONE": 20,
		"BAN_MEMBERS": 19,
		"KICK_MEMBERS": 18,
		"MOVE_MEMBERS": 17,
		"DEAFEN_MEMBERS": 16,
		"MUTE_MEMBERS": 15,
		"MANAGE_MESSAGES": 14,
		"MANAGE_NICKNAMES": 13,
		"USE_EXTERNAL_EMOJIS": 12,
		"ATTACH_FILES": 11,
		"SEND_TTS_MESSAGES": 10,
		"ADD_REACTIONS": 9,
		"EMBED_LINKS": 8,
		"CHANGE_NICKNAME": 7,
		"USE_VAD": 6,
		"SPEAK": 5,
		"CONNECT": 4,
		"CREATE_INSTANT_INVITE": 3,
		"SEND_MESSAGES": 2,
		"READ_MESSAGE_HISTORY": 1,
		"READ_MESSAGES": 0
	},
};

exports = module.exports;