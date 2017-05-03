/*

addCommand\((\[.+?\]), (\w+?), (\w+?), (\w+?), function\(cmd, args, msgObj, speaker, channel, guild\) {\n\t([\s\S]+?)\n},\n\t(".*?"),\n\t(".*?"),\n\t(".*?")\n\)

Cmds.addCommand({
	cmds: \1,

	requires: {
		guild: \4,
		loud: false
	},

	desc: \6,

	syntax: \7,

	example: \8,

	func: (cmd, args, msgObj, speaker, channel, guild) => {
	\5
	}
})

*/

const FileSys = require("fs"),
	DateFormat = require("dateformat"),
	path = require("path");

function getURLChecker() {
	var
		SCHEME = "[a-z\\d.-]+://",
		IPV4 = "(?:(?:[0-9]|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])\\.){3}(?:[0-9]|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])",
		HOSTNAME = "(?:(?:[^\\s!@#$%^&*()_=+[\\]{}\\\\|;:'\",.<>/?]+)\\.)+",
		TLD = "(?:ac|ad|aero|ae|af|ag|ai|al|am|an|ao|aq|arpa|ar|asia|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|biz|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|cat|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|coop|com|co|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|edu|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|info|int|in|io|iq|ir|is|it|je|jm|jobs|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mil|mk|ml|mm|mn|mobi|mo|mp|mq|mr|ms|mt|museum|mu|mv|mw|mx|my|mz|name|na|nc|net|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|place|pl|pm|pn|pro|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|trade|travel|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wiki|wf|ws|xn--0zwm56d|xn--11b5bs3a9aj6g|xn--80akhbyknj4f|xn--9t4b11yi5a|xn--deba0ad|xn--g6w251d|xn--hgbk6aj7f53bba|xn--hlcj6aya9esc7a|xn--jxalpdlp|xn--kgbechtv|xn--zckzah|ye|yt|yu|za|zm|zw)",
		HOST_OR_IP = "(?:" + HOSTNAME + TLD + "|" + IPV4 + ")",
		PATH = "(?:[;/][^#?<>\\s]*)?",
		QUERY_FRAG = "(?:\\?[^#<>\\s]*)?(?:#[^<>\\s]*)?",
		URI1 = "\\b" + SCHEME + "[^<>\\s]+",
		URI2 = "\\b" + HOST_OR_IP + PATH + QUERY_FRAG + "(?!\\w)",
		
		MAILTO = "mailto:",
		EMAIL = "(?:" + MAILTO + ")?[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@" + HOST_OR_IP + QUERY_FRAG + "(?!\\w)",
		
		URI_RE = new RegExp( "(?:" + URI1 + "|" + URI2 + "|" + EMAIL + ")", "ig" ),
		SCHEME_RE = new RegExp( "^" + SCHEME, "i" ),
		
		quotes = {
			"'": "`",
			'>': '<',
			')': '(',
			']': '[',
			'}': '{',
			'»': '«',
			'›': '‹'
		},
		
		default_options = {
			callback: function( text, href ) {
				return href || null;
			},
			punct_regexp: /(?:[!?.,:;'"]|(?:&|&amp;)(?:lt|gt|quot|apos|raquo|laquo|rsaquo|lsaquo);)$/
		};

	function checkURLs( txt, options ) {
		txt = txt.replaceAll("\\", "");
		txt = txt.replaceAll("*", "");
		txt = txt.replaceAll("_", "");

		if (txt.includes("roblox")) console.log(txt);

		options = options || {};
		
		// Temp variables.
		var arr,
			i,
			link,
			href,
			
			// Output HTML.
			html = '',
			
			// Store text / link parts, in order, for re-combination.
			parts = [],
			
			// Used for keeping track of indices in the text.
			idx_prev,
			idx_last,
			idx,
			link_last,
			
			// Used for trimming trailing punctuation and quotes from links.
			matches_begin,
			matches_end,
			quote_begin,
			quote_end;
		
		// Initialize options.
		for ( i in default_options ) {
			if ( options[ i ] === undefined ) {
				options[ i ] = default_options[ i ];
			}
		}
		
		// Find links.
		while ( arr = URI_RE.exec( txt ) ) {
			
			link = arr[0];
			idx_last = URI_RE.lastIndex;
			idx = idx_last - link.length;
			
			// Not a link if preceded by certain characters.
			if ( /[\/:]/.test( txt.charAt( idx - 1 ) ) ) {
				continue;
			}
			
			// Trim trailing punctuation.
			do {
				// If no changes are made, we don't want to loop forever!
				link_last = link;
				
				quote_end = link.substr( -1 );
				quote_begin = quotes[ quote_end ];
				
				// Ending quote character?
				if ( quote_begin ) {
					matches_begin = link.match( new RegExp( '\\' + quote_begin + '(?!$)', 'g' ) );
					matches_end = link.match( new RegExp( '\\' + quote_end, 'g' ) );
					
					// If quotes are unbalanced, remove trailing quote character.
					if ( ( matches_begin ? matches_begin.length : 0 ) < ( matches_end ? matches_end.length : 0 ) ) {
						link = link.substr( 0, link.length - 1 );
						idx_last--;
					}
				}
				
				// Ending non-quote punctuation character?
				if ( options.punct_regexp ) {
					link = link.replace( options.punct_regexp, function(a) {
						idx_last -= a.length;
						return '';
					});
				}
			} while ( link.length && link !== link_last );
			
			href = link;
			
			// Add appropriate protocol to naked links.
			if ( !SCHEME_RE.test( href ) ) {
				href = ( href.indexOf( '@' ) !== -1 ? ( !href.indexOf( MAILTO ) ? '' : MAILTO )
					: !href.indexOf( 'irc.' ) ? 'irc://'
					: !href.indexOf( 'ftp.' ) ? 'ftp://'
					: 'http://' ) + href;
			}
			
			// Push preceding non-link text onto the array.
			if ( idx_prev != idx ) {
				parts.push([ txt.slice( idx_prev, idx ) ]);
				idx_prev = idx_last;
			}
			
			// Push massaged link onto the array
			parts.push([ link, href ]);
		}
		
		// Push remaining non-link text onto the array.
		parts.push([ txt.substr( idx_prev ) ]);
		
		// Process the array items.
		var URLs = [];

		for ( i = 0; i < parts.length; i++ ) {
			var result = options.callback.apply( "nooone", parts[i] );
			if (result) {
				URLs.push(result);
			}
		}

		return URLs;
	}

	return checkURLs;
}

exports.checkURLs = getURLChecker();

exports.capitalize = function(str) {
	str = String(str);
	return str.charAt(0).toUpperCase() + str.slice(1);
};

exports.capitalize2 = function(str, repUnder) {
	str = String(str);
	if (repUnder) str = str.replaceAll("_", " ");
	str = str.replace(/[0-9a-z]+/ig, function(txt){console.log(txt); return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
	return str;
};

exports.boolToAns = function(bool) {
	return bool ? "Yes" : "No";
};

exports.safe = function(str) {
	if (typeof(str) == "string") return str.replace(/`/g, "\\`").replace(/@/g, "@­");
};

exports.safe2 = function(str) {
	if (typeof(str) == "string") return str.replace(/`/g, "\\`");
};

exports.safeEveryone = function(str) {
	if (typeof(str) == "string") {
		var newStr = str.replace(/@everyone/g, "@​everyone");
		return newStr.replace(/@here/g, "@​here");
	}
};

exports.fix = function(str) {
	return ("`" + Util.safe(str) + "`");
};

exports.toFixed = function(num, decimals) {
	return Number(num.Util.toFixed(decimals)).toString();
};

exports.grabFiles = (filePath, filter = (file) => true) => {
	let dirFiles = FileSys.readdirSync(filePath);
	let fullFiles = [];
	dirFiles.forEach(file => {
		let fileData = FileSys.lstatSync(`${filePath}${file}`);
		if (fileData.isDirectory()) {
			let toAdd = exports.grabFiles(`${filePath}${file}/`, filter);
			fullFiles = fullFiles.concat(toAdd);
		} else if(filter(file)) {
			fullFiles.push(`${filePath}${file}`);
		}
	});
	return fullFiles;
};

exports.bulkRequire = (filePath) => {
	let bulkFiles = exports.grabFiles(filePath, file => file.endsWith(".js"));

	for (let i in bulkFiles) {
		exports.pathRequire(bulkFiles[i]);
	}
};

exports.pathRequire = (filePath) => {
	let file = path.resolve(filePath);
	delete require.cache[require.resolve(file)];

	let fileData = require(filePath);

	let dirName = /(\w+)[\/\\]\w+\.js$/.exec(file)[1];

	if (dirName && index.commandTypes.hasOwnProperty(dirName)) {
		for (var commandType in index.commandTypes) {
			if (!index.commandTypes.hasOwnProperty(commandType)) continue;
			var commandKey = index.commandTypes[commandType];
			if (commandKey != "null") {
				if (commandType == dirName) {
					fileData[2][commandKey] = true;
				} else {
					fileData[2][commandKey] = false;
				}
			}
		}
	}
};

exports.checkStaff = function(guild, member) {
	if (member.id == vaebId || member.id == selfId || member.id == guild.ownerID) return true;
	var speakerRoles = member.roles;
	if (!speakerRoles) return false;
	return speakerRoles.some(role => {
		return role.name == "Staff" || role.name == "Owner/Seller" || role.name == "Bot Admin" || role.name == "Moderator" || role.name == "Head Mod";
	});
};

exports.commandFailed = function(channel, speaker, message) {
	Util.sendEmbed(channel, "Command Failed", message, Util.makeEmbedFooter(speaker), null, 0x00E676, null);
	return false;
};

exports.getRandomInt = function(min, max) { //inclusive, exclusive
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
};

/*function chunkStringLine(str, size) {
	var numChunks = Math.ceil(str.length / size);
	var chunks = [];

	for (var i = 0, o = 0; i < numChunks; ++i, o += size) {
		chunks[i] = str.substr(o, size);
	}

	var chunkLength = chunks.length;

	if (numChunks > 1) {
		for (var i = 0; i < chunkLength; i++) {
			var nowChunk = chunks[i];
			var lastLine = nowChunk.lastIndexOf("\n");
			if (lastLine >= 0) {
				var nowChunkMsg = nowChunk.substring(0, lastLine);
				chunks[i] = nowChunkMsg;
				var nextChunkMsg = nowChunk.substring(lastLine+1);
				if (chunks[i+1] == null) {
					if (nextChunkMsg == "" || nextChunkMsg == "\n" || nextChunkMsg == "```" || nextChunkMsg == "\n```") break;
					chunks[i+1] = "";
				}
				chunks[i+1] = nextChunkMsg + chunks[i+1];
			}
		}
	}

	return chunks;
}*/

/*

-Chunk string into sets of 2k chars
-For each chunk
	-If msg includes newline and first character of next message isn't newline
		-Find last newline (unless start of next chunk is newline in which case use the if statement below), where the character before it isn't a codeblock
		-Copy everything after the newline to the start of the next chunk
		-Set msg to everything before the newline
	-If number of code blocks is odd and there are non-whitespace characters after the last codeblock
		-Add a codeblock to the end of the chunk
	-If number of characters is above 2000
		-Find last newline under (or equal) the 2001 character mark, where the character before it isn't a codeblock
		-If no newline
			-Append a newline as <= 2001st character (not between code blocks if possible)
		-Copy everything after the newline (but before the code block), then append it (with an extra newline on the end) to the start of the next chunk
		-Cut the chunk to everything before the newline

*/

exports.isObject = function(val) {
	if (val == null) return false;
	return (typeof(val) === "object");
};

exports.cloneObj = function(obj) {
	var copy;

	if (null == obj || typeof(obj) != "object") return obj;

	if (obj instanceof Date) {
		copy = new Date();
		copy.setTime(obj.getTime());
		return copy;
	}

	if (obj instanceof Array) {
		copy = [];
		var len = obj.length;
		for (var i = 0; i < len; i++) {
			copy[i] = Util.cloneObj(obj[i]);
		}
		return copy;
	}

	if (obj instanceof Object) {
		copy = {};
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr)) copy[attr] = Util.cloneObj(obj[attr]);
		}
		return copy;
	}

	throw new Error("Unable to copy obj! Its type isn't supported.");
};

exports.formatTime = function(time) {
	var timeStr;
	var formatStr;

	var numSeconds = Util.round(time/1000, 1);
	var numMinutes = Util.round(time/60000, 0.1);
	var numHours = Util.round(time/3600000, 0.1);
	var numDays = Util.round(time/86400000, 0.1);

	if (numSeconds < 60) {
		timeStr = numSeconds.Util.toFixed(0);
		formatStr = timeStr + " second";
	} else if (numMinutes < 60) {
		timeStr = numMinutes % 1 === 0 ? numMinutes.Util.toFixed(0) : numMinutes.Util.toFixed(1);
		formatStr = timeStr + " minute";
	} else if (numHours < 60) {
		timeStr = numHours % 1 === 0 ? numHours.Util.toFixed(0) : numHours.Util.toFixed(1);
		formatStr = timeStr + " hour";
	} else if (numDays < 60) {
		timeStr = numDays % 1 === 0 ? numDays.Util.toFixed(0) : numDays.Util.toFixed(1);
		formatStr = timeStr + " day";
	}

	if (timeStr != "1") formatStr = formatStr + "s";

	return formatStr;
};

exports.chunkString = function(str, maxChars) {
	var iterations = Math.ceil(str.length/maxChars);
	var chunks = new Array(iterations);
	for (var i = 0, j = 0; i < iterations; ++i, j += maxChars) chunks[i] = str.substr(j, maxChars);
	return chunks;
};

exports.cutStringSafe = function(msg, postMsg, lastIsOpener) { //Tries to cut the string along a newline
	var lastIndex = msg.lastIndexOf("\n");
	if (lastIndex < 0) return [msg, postMsg];
	var preCut = msg.substring(0, lastIndex);
	var postCut = msg.substring(lastIndex+1);
	var postHasBlock = postCut.includes("```");
	if (postHasBlock && !lastIsOpener) { //If postCut is trying to pass over a code block (not allowed) might as well just cut after the code block (as long as it's a closer)
		lastIndex = msg.lastIndexOf("```");
		preCut = msg.substring(0, lastIndex+3);
		postCut = msg.substring(lastIndex+3);
	} else {
		var strEnd1 = preCut.substr(Math.max(preCut.length-3, 0), 3);
		var strEnd2 = preCut.substr(Math.max(preCut.length-4, 0), 4);
		if (postHasBlock || (lastIsOpener && (strEnd1 == "```" || strEnd2 == "``` " || strEnd2 == "```\n"))) { //If post is triyng to pass over opener or last section of preCut is an opener
			return [msg, postMsg];
		}
	}
	return [preCut, postCut + postMsg];
};

exports.fixMessageLengthNew = function(msg) {
	let argsFixed = Util.chunkString(msg, 2000); //Group string into sets of 2k chars
	//argsFixed.forEach(o => console.log("---\n" + o));
	let totalBlocks = 0; //Total number of *user created* code blocks come across so far (therefore if the number is odd then code block is currently open)
	for (let i = 0; i < argsFixed.length; i++) {
		let passOver = ""; //String to pass over as the start of the next chunk
		let msg = argsFixed[i];
		let numBlock = (msg.match(/```/g) || []).length; //Number of user created code blocks in this chunk
		if (totalBlocks % 2 == 1) msg = "```\n" + msg; //If code block is currently open then this chunk needs to be formatted
		totalBlocks += numBlock; //The user created code blocks may close/open new code block (don't need to include added ones because they just account for seperate messages)
		let lastIsOpener = totalBlocks % 2 == 1; //Checks whether the last code block is an opener or a closer
		if (lastIsOpener && msg.length > 1996) { //If the chunk ends with the code block still open then it needs to be auto-closed so the chunk needs to be shortened so it can fit
			passOver = msg.substring(1996);
			msg = msg.substr(0, 1996);
			let numPass = (passOver.match(/```/g) || []).length; //If we end up passing over code blocks whilst trying to shorten the string, we need to account for the new amount
			totalBlocks -= numPass;
			if (numPass % 2 == 1) lastIsOpener = false;
		}
		let nextMsg = passOver + (argsFixed[i+1] != null ? argsFixed[i+1] : ""); //Message for next chunk (or empty string if none)
		if (nextMsg !== "" && nextMsg[0] != "\n" && msg.includes("\n")) { //If start of next chunk is a newline then can just leave the split as it is now (same goes for this chunk having no newlines)
			let cutData = Util.cutStringSafe(msg, "", lastIsOpener);
			msg = cutData[0];
			passOver = cutData[1] + passOver;
		}
		if (lastIsOpener) msg += "\n```"; //Close any left over code blocks (and re open on next chunk if they continue)
		argsFixed[i] = msg;
		if (passOver.length > 0) { //Whether any text actually needs to be passed
			if (argsFixed[i+1] == null) argsFixed[i+1] = ""; //Create new chunk if this is the last one
			argsFixed[i+1] = passOver + argsFixed[i+1];
		}
	}
	return argsFixed;
};

/*function fixMessageLength(msg) {
	var argsFixed = chunkStringLine(msg, 2000);
	var argsLength = argsFixed.length;
	for (var i = 0; i < argsFixed.length; i++) {
		var passOver = "";
		var msg = argsFixed[i];
		//console.log("Original message length: " + msg.length);
		if (msg.length > 1996) {
			passOver = msg.substring(1996);
			msg = msg.substring(0, 1996);
			//console.log("passStart orig: " + passOver.length);
			var lastLine = msg.lastIndexOf("\n");
			if (lastLine >= 5) {
				var msgEnd = lastLine;
				var passStart = msgEnd+1;
				passOver = msg.substring(passStart) + passOver;
				msg = msg.substring(0, msgEnd);
				//console.log("passOver: " + passOver.length);
				//console.log("msg: " + msg.length);
				//console.log("lastLine: " + lastLine);
			}
		}
		var numBlock = (msg.match(/```/g) || []).length;
		if (numBlock % 2 == 1) {
			passOver = "```\n" + passOver;
			msg = msg + "\n```";
		}
		argsFixed[i] = msg;
		//console.log("Message length: " + msg.length);
		//console.log("Pass Over: " + passOver.length);
		if (passOver != "" && (argsFixed[i+1] != null || passOver != "```\n")) {
			if (argsFixed[i+1] == null) {
				//console.log("Created new print block extender")
				argsFixed[i+1] = "";
			}
			argsFixed[i+1] = passOver + argsFixed[i+1];
		}
	}

	return argsFixed;
}*/

exports.splitMessages = function(messages) {
	var fixed = Util.fixMessageLengthNew(messages.join(" "));
	return fixed;
};

var ePrint = error => console.log("\n[E_Print] " + error);

exports.print = function(channel) {
	var args = Array.from(arguments);
	args.splice(0, 1);
	var messages = Util.splitMessages(args);
	for (var i = 0; i < messages.length; i++) {
		channel.send(messages[i])
		.catch(ePrint);
	}
};

exports.sortPerms = function(permsArr) {
	permsArr.sort(function(a, b) {
		return permissionsOrder[b] - permissionsOrder[a];
	});
};

exports.getGuildRoles = function(guild) {
	var roles = [];
	var guildRoles = guild.roles;

	guildRoles.forEach((nowRole, i) => {
		var rolePos = nowRole.position;
		var index;

		for (index = 0; index < roles.length; index++) {
			if (rolePos > roles[index].position) {
				break;
			}
		}

		roles.splice(index, 0, nowRole);
	});

	return roles;
};

exports.getName = function(member) {
	return member.username || (member.user ? member.user.username : null);
};

exports.getDisplayName = function(member) {
	return member.displayName || (member.user ? member.user.username : null);
};

exports.getMostName = function(user) {
	return Util.getName(user) + "#" + user.discriminator;
};

exports.getFullName = function(user) {
	return user != null ? (Util.getMostName(user) + " (" + user.id + ")") : "null";
};

exports.getMention = function(obj) {
	return obj.toString();
};

exports.getAvatar = function(user, outStr) {
	return (user != null && Util.isObject(user)) ? (user.avatarURL || (user.user ? user.user.avatarURL : null)) : (outStr === true ? "null" : null);
};

exports.getDateString = function(d) {
	return DateFormat(d, "ddd, mmm dS yyyy @ h:MM TT") + " GMT";
};

exports.hasRole = function(member, role) {
	return member.roles.has(role.id);
};

exports.makeEmbedFooter = function(user) {
	var memberName = Util.isObject(user) ? Util.getDisplayName(user) : String(user);
	var dateStr = Util.getDateString(new Date());
	return {text: memberName + " | " + dateStr, icon_url: Util.getAvatar(user)};
};

/*

	If nowString is less than or exactly 512 characters set as field value and return nowFieldNum
	Find last newline under 512 characters
	If none exists then trim, set and return nowFieldNum
	Set everything before newline as value for the field
	Create new field immediately after current field
	Set name as zero width character
	Return function on new field and string after newline

*/

exports.setFieldValue = function(embFields, nowFieldNum, nowString) {
	var nowField = embFields[nowFieldNum];
	if (nowString.length <= 512) {
		nowField.value = nowString;
		return nowFieldNum;
	}
	var subFirst = nowString.substr(0, 512);
	var subNext;
	var lastNewline = subFirst.lastIndexOf("\n");
	if (lastNewline < 0) {
		var lastSpace = subFirst.lastIndexOf(" ");
		if (lastSpace < 0) {
			subNext = nowString.substring(512);
		} else {
			subFirst = nowString.substring(0, lastSpace);
			subNext = nowString.substring(lastSpace+1);
		}
	} else {
		subFirst = nowString.substring(0, lastNewline);
		subNext = nowString.substring(lastNewline+1);
	}
	nowField.value = subFirst;
	var newFieldNum = nowFieldNum+1;
	embFields.splice(newFieldNum, 0, {name: "​", value: "", inline: nowField.inline});
	return Util.setFieldValue(embFields, newFieldNum, subNext);
};

/*

Max characters:

Title: 256
Description: 2048
Footer: 2048
Field Name: 256
Field Value: 512 (maybe 1024?)

*/

exports.sendEmbed = function(embChannel, embTitle, embDesc, embFooter, embImage, embColor, embFields, isContinued) {
	if (embChannel == null) return;

	var manyFields = false;
	var extraFields;

	if (embFields == null) embFields = [];

	if (embFields.length > 25) {
		manyFields = true;
		extraFields = embFields.splice(25);
	}

	for (var i = 0; i < embFields.length; i++) {
		var nowField = embFields[i];

		if (!nowField.hasOwnProperty("inline")) nowField.inline = true;

		var nowName = nowField.name;
		var nowValue = nowField.value;

		nowName = Util.safeEveryone(String(nowName == null ? "N/A" : nowName));
		nowValue = Util.safeEveryone(String(nowValue == null ? "N/A" : nowValue));

		nowField.name = nowName.trim().length < 1 ? "N/A" : nowName.substr(0, 256);

		if (nowValue.trim().length < 1) {
			nowField.value = "N/A";
		} else if (nowValue.length > 512) {
			i = Util.setFieldValue(embFields, i, nowValue);
		} else {
			nowField.value = nowValue;
		}
	}

	var embDescStr = String(embDesc);

	var newTitle;
	var newFooter;
	var newDesc = ((embDesc == null || embDescStr.trim().length < 1) ? "​" : embDescStr.substr(0, 2048));

	if (embTitle) newTitle = embTitle.substr(0, 256);
	if (embFooter) {
		if (!Util.isObject(embFooter)) {
			embFooter = {text: embFooter};
		}
		newFooter = Util.cloneObj(embFooter);
		newFooter.text = (newFooter.text).substr(0, 2048);
	}

	if (isContinued) {
		newTitle = null;
		if (newDesc.length < 1 || newDesc == "​") newDesc = null;
	}

	if (manyFields) {
		newFooter = null;
	}

	var embObj = {
		title: newTitle,
		description: newDesc,
		fields: embFields,
		footer: newFooter,
		thumbnail: {url: embImage},
		color: embColor
	};

	embChannel.send(undefined, {embed: embObj})
	.catch(error => {
		console.log("\n[E_SendEmbed] " + error + " " + embChannel);
		console.log(embObj);
		console.log(JSON.stringify(embFields));
	});

	if (manyFields) {
		Util.sendEmbed(embChannel, embTitle, embDesc, embFooter, embImage, embColor, extraFields, true);
	}
};

exports.sendDescEmbed = function(embChannel, embTitle, embDesc, embFooter, embImage, embColor) {
	if (embChannel == null) return;
	if (embColor == null) embColor = 0x00BCD4;

	if (embDesc != null && embDesc.length > 2048) {
		var subFirst = embDesc.substr(0, 2048);
		var subNext;
		var lastNewline = subFirst.lastIndexOf("\n");
		if (lastNewline < 0) {
			var lastSpace = subFirst.lastIndexOf(" ");
			if (lastSpace < 0) {
				subNext = embDesc.substring(2048);
			} else {
				subFirst = embDesc.substring(0, lastSpace);
				subNext = embDesc.substring(lastSpace+1);
			}
		} else {
			subFirst = embDesc.substring(0, lastNewline);
			subNext = embDesc.substring(lastNewline+1);
		}
		Util.sendEmbed(embChannel, embTitle, subFirst, null, embImage, embColor, []);
		Util.sendDescEmbed(embChannel, null, subNext, embFooter, embImage, embColor);
	} else {
		Util.sendEmbed(embChannel, embTitle, embDesc, embFooter, embImage, embColor, []);
	}
};

exports.sendLog = function(embData, embColor) {
	var embTitle = embData[0];
	var embGuild = embData[1];
	var embAuthor = embData[2];
	var embFields = embData.splice(3);

	var embChannel = Util.findChannel("vaebot-log", embGuild);
	if (embChannel == null) return;

	var embFooter = Util.makeEmbedFooter(embAuthor);
	var embAvatar = Util.getAvatar(embAuthor);

	Util.sendEmbed(
		embChannel,
		embTitle,
		null,
		embFooter,
		embAvatar,
		embColor,
		embFields
	);
};

exports.getHourStr = function(d) {
	var valStr = (d.getHours()).toString();
	if (valStr.length < 2) valStr = "0" + valStr;
	return valStr;
};

exports.getMinStr = function(d) {
	var valStr = (d.getMinutes()).toString();
	if (valStr.length < 2) valStr = "0" + valStr;
	return valStr;
};

exports.getYearStr = function(d) {
	var valStr = (d.getFullYear()).toString();
	return valStr;
};

exports.getMonthStr = function(d) {
	var valStr = (d.getMonth()+1).toString();
	if (valStr.length < 2) valStr = "0" + valStr;
	return valStr;
};

exports.getDayStr = function(d) {
	var valStr = (d.getDate()).toString();
	if (valStr.length < 2) valStr = "0" + valStr;
	return valStr;
};

/*function searchPartial(array, name, checkPartial) {
	if (checkPartial != false) {
		var firstChar = name.substr(0, 1);
		var endChar = name.substr(name.length-1, 1);
		if (firstChar == "\"" && endChar == "\"") {
			checkPartial = false;
			name = name.substring(1, name.length-1);
			if (name.length < 1) return;
		}
	}
	name = name.toLowerCase()
	var user = array.find(function(item) {
		var user = Util.getName(item);
		if (checkPartial != false ? Util.safe(user.toLowerCase()).includes(name) : Util.safe(user.toLowerCase()) == name) {
			return true;
		}
		return false;
	})
	return user;
}*/

exports.searchUserPartial = function(col, name) {
	name = name.toLowerCase();
	return col.find(function(member) {
		var userName = Util.getName(member);
		if (member.id == name || Util.safe(userName.toLowerCase()).includes(name)) {
			return true;
		}
		return false;
	});
};

exports.round = function(num, inc) {
	return (inc === 0 ? num : Math.floor(num/inc+0.5)*inc);
};

exports.write = function(content, name) {
	fileSystem.writeFile(name, content);
};

exports.remove = function(name) {
	fileSystem.unlink(name);
};

exports.checkMuted = function(id, guild) {
	return (Data.guildGet(guild, muted, id) ? true : false);
};

exports.getHistory = function(id, guild) {
	var userHistory = Data.guildGet(guild, history, id);
	if (userHistory) return userHistory[0];
	return 0;
};

exports.historyToString = function(num) {
	var timeHours = Util.round(num/3600000, 0.1);
	timeHours = (timeHours >= 1 || timeHours === 0) ? timeHours.Util.toFixed(0) : timeHours.Util.toFixed(1);
	return timeHours + (timeHours == 1 ? " hour" : " hours");
};

exports.getSafeId = function(id) {
	id = id.match(/\d+/);
	if (id == null) return;
	return id[0];
};

exports.getMemberById = function(id, guild) {
	if (guild == null || id == null) return;
	if (id.substr(0, 1) == "<" && id.substr(id.length-1, 1) == ">") id = Util.getSafeId(id);
	if (id == null || id.length < 1) return;
	var members = guild.members;
	return members.find(member => {
		return member.id == id;
	});
};

exports.getMatchStrength = function(fullStr, subStr) { // [v2.0]
	var value = 0;

	var fullStrLower = fullStr.toLowerCase();
	var subStrLower = subStr.toLowerCase();

	var nameMatch = fullStrLower.indexOf(subStrLower);

	if (nameMatch >= 0) {
		var filled = Math.min(subStr.length/fullStr.length, 0.999);
		value += Math.pow(2, 2+filled);

		var maxCaps = Math.min(subStr.length, fullStr.length);
		var numCaps = 0;
		for (var j = 0; j < maxCaps; j++) {
			if (subStr[j] == fullStr[nameMatch+j]) numCaps++;
		}
		var caps = Math.min(numCaps/maxCaps, 0.999);
		value += Math.pow(2, 1+caps);

		var totalPosition = fullStr.length-subStr.length;
		var perc = 1 - (totalPosition*nameMatch === 0 ? 0.001 : nameMatch/totalPosition);
		value += Math.pow(2, perc);
	}

	return value;
};

exports.getMemberByName = function(name, guild) { // [v2.0] Visible name match, real name match, caps match, length match, position match
	if (guild == null) return;

	var str2Lower = name.toLowerCase();

	var members = guild.members;
	var matchStrength = [];
	var strongest = [0, undefined];

	members.forEach((member, id) => {
		var value = 0;

		var realName = member.nickname != null ? member.nickname : Util.getName(member);
		var realstr2Lower = realName.toLowerCase();
		var nameMatch = realstr2Lower.indexOf(str2Lower);

		if (nameMatch >= 0) {
			value += Math.pow(2, 4);
		} else {
			realName = Util.getName(member);
			realstr2Lower = realName.toLowerCase();
			nameMatch = realstr2Lower.indexOf(str2Lower);
			if (nameMatch >= 0) {
				value += Math.pow(2, 3);
			}
		}

		if (nameMatch >= 0) {
			//console.log("\n(" + i + ") " + realName + ": " + value);
			var filled = Math.min(name.length/realName.length, 0.999);
			//console.log("filled: " + filled);
			value += Math.pow(2, 2+filled);

			var maxCaps = Math.min(name.length, realName.length);
			var numCaps = 0;
			for (var j = 0; j < maxCaps; j++) {
				if (name[j] == realName[nameMatch+j]) numCaps++;
			}
			var caps = Math.min(numCaps/maxCaps, 0.999);
			//console.log("caps: " + caps + " (" + numCaps + "/" + maxCaps + ")");
			value += Math.pow(2, 1+caps);

			var totalPosition = realName.length-name.length;
			var perc = 1 - (totalPosition*nameMatch === 0 ? 0.001 : nameMatch/totalPosition);
			//console.log("pos: " + perc + " (" + nameMatch + "/" + totalPosition + ")");
			value += Math.pow(2, perc);

			//console.log(value);
			matchStrength.push([value, member]);
		}
	});
	for (var i = 0; i < matchStrength.length; i++) {
		var strength = matchStrength[i];
		if (strength[0] > strongest[0]) strongest = strength;
	}
	return strongest[1];
};

exports.getDataFromString = function(str, funcs, returnExtra) {
	var mix = str.split(" ");
	var baseStart = mix.length-1;
	var start = baseStart;
	var end = 0;
	var pos = start;
	var index = 0;
	var combine = [];
	var results = [];
	while (start >= 0) {
		var remainingFuncs = funcs.length - index - 1;
		var remainingTerms = baseStart - (start);
		if (remainingTerms < remainingFuncs) {
			start--;
			pos = start;
			combine = [];
			continue;
		}
		var chunk = mix[pos];
		if (chunk != null) combine.unshift(chunk);
		if (pos <= end) {
			var result = funcs[index](combine.join(" "), results);
			if (result != null) {
				/*if (index == 1) {
					console.log("[Z] " + combine.join(" "));
					console.log("[Z] " + remainingFuncs);
					console.log("[Z] " + remainingTerms);
					console.log("[Z] " + pos);
					console.log("[Z] " + start);
					console.log("[Z] " + end);
					console.log("[Z] " + result);
				}*/
				results.push(result);
				index++;
				if (index >= funcs.length) {
					if (returnExtra) {
						combine = [];
						for (var i = start+1; i < mix.length; i++) {
							var extra = mix[i];
							if (extra != null) combine.push(extra);
						}
						var leftOver = "";
						if (combine.length > 0) leftOver = combine.join(" ");
						results.push(leftOver);
					}
					return results;
				}
				end = start+1;
				if (end > baseStart) return;
				start = baseStart;
			} else {
				start--;
			}
			pos = start;
			combine = [];
		} else {
			pos--;
		}
	}
};

exports.clamp = function(num, min, max) {
	if (min == null) min = num;
	if (max == null) max = num;
	return Math.min(Math.max(num, min), max);
};

exports.toBoolean = function(str) {
	return (typeof(str) === "boolean" ? str : (str === "true" || (str === "false" ? false : undefined)));
};

exports.getNum = function(str, min, max) {
	var num = Number(str);
	if (isNaN(num)) return;
	return Util.clamp(num, min, max);
};

exports.getInt = function(str, min, max) {
	var num = parseInt(str);
	if (isNaN(num)) return;
	return Util.clamp(num, min, max);
};

exports.isTextChannel = function(channel) {
	return channel.type == "text";
};

exports.isVoiceChannel = function(channel) {
	return channel.type == "voice";
};

exports.getTextChannels = function(guild) {
	return guild.channels.filter(exports.isTextChannel);
};

exports.getVoiceChannels = function(guild) {
	return guild.channels.filter(exports.isVoiceChannel);
};

exports.findChannel = function(name, guild) {
	if (guild == null) return;
	name = name.toLowerCase();
	var channels = Util.getTextChannels(guild);
	return channels.find(nowChannel => {
		return nowChannel.id == name || nowChannel.name.toLowerCase() == name;
	});
};

exports.findVoiceChannel = function(name, guild) {
	if (guild == null) return;
	name = name.toLowerCase();
	var channels = Util.getVoiceChannels(guild);
	return channels.find(nowChannel => {
		return nowChannel.id == name || nowChannel.name.toLowerCase() == name;
	});
};

exports.getRole = function(name, obj) {
	if (obj == null) return;
	name = name.toLowerCase();
	var roles = obj.roles;
	return roles.find(role => {
		return role.name.toLowerCase().includes(name);
	});
};

exports.getHighestRole = function(member) {
	return member.highestRole;
};

exports.getPosition = function(speaker) {
	if (speaker == null || !Util.isObject(speaker)) return;
	var roles = speaker.roles;
	if (speaker.id == speaker.guild.ownerID) return 999999999;
	return speaker.highestRole.position;
};

exports.getUserById = function(id) {
	return client.users.get(id);
};

exports.getUserByName = function(name) {
	return Util.searchUserPartial(client.users, name);
};

exports.getUserByMixed = function(name) {
	var user = Util.getUserById(name);
	if (user == null) user = Util.getUserByName(name);
	return user;
};

exports.getMemberByMixed = function(name, guild) {
	if (guild == null) return;
	var targetMember = Util.getMemberById(name, guild);
	if (targetMember == null) targetMember = Util.getMemberByName(name, guild);
	return targetMember;
};

exports.getMemberOrRoleByMixed = function(name, guild) {
	if (guild == null) return;
	var targetObj = Util.getRole(name, guild);
	if (targetObj == null) targetObj = Util.getMemberById(name, guild);
	if (targetObj == null) targetObj = Util.getMemberByName(name, guild);
	return targetObj;
};

exports.getEitherByMixed = function(name, guild) {
	var user = Util.getMemberByMixed(name, guild);
	if (user == null) user = Util.getUserByMixed(name);
	return user;
};

exports.permEnabled = function(iPerms, permName) {
	var allowGeneral = iPerms.General;
	var allowText = iPerms.Text;
	var allowVoice = iPerms.Voice;

	if (allowGeneral.hasOwnProperty(permName)) return allowGeneral[permName];
	if (allowText.hasOwnProperty(permName)) return allowText[permName];
	if (allowVoice.hasOwnProperty(permName)) return allowVoice[permName];
};

exports.getPermRating = function(guild, userOrRole) {
	if (userOrRole.hasPermission == null) return 0;

	var tempPermRating = Util.cloneObj(permRating);

	var total = 0;
	var foundTop = false;

	for (let i = 0; i < tempPermRating.length; i++) {
		let permData = tempPermRating[i];
		if (userOrRole.hasPermission(permData[0], false)) {
			if (!foundTop) {
				foundTop = true;
				
				let lastVal = null;
				let pointer0 = i+1;
				let pointer1 = i+1;
				let newVal = 5;

				//console.log("found", permData[0]);

				for (let i2 = i+1; i2 < tempPermRating.length; i2++) {
					let nowVal = tempPermRating[i2][1];
					if (lastVal == null) lastVal = nowVal;
					if (nowVal != lastVal) {
						let numPoints = pointer1-pointer0+1;
						newVal = newVal / numPoints;
						for (let n = pointer0; n <= pointer1; n++) {
							tempPermRating[n][1] = newVal;
						}
						newVal = newVal / 2;
						pointer0 = i2;
					}
					pointer1 = i2;
					lastVal = nowVal;
				}

				let numPoints = pointer1-pointer0+1;
				newVal = newVal / numPoints;
				for (let n = pointer0; n <= pointer1; n++) {
					tempPermRating[n][1] = newVal;
				}

				//console.log(tempPermRating);

			}
			total += permData[1];
		}
	}

	total = Math.min(total, 100);

	return total;
};

exports.getMemberPowers = function(guild) {
	var sorted = [];
	var members = guild.members;
	for (var i = 0; i < members.size; i++) {
		var member = members[i];
		var power = Util.getPermRating(guild, member);
		var index = 0;
		for (index = 0; index < sorted.length; index++) {
			if (power >= sorted[index][1]) break;
		}
		sorted.splice(index, 0, [member, power]);
	}
	return sorted;
};

exports.strToPerm = function(str) {
	str = str.toUpperCase().replaceAll(" ", "_");

	var matchPerm = null;
	var matchTop = 0;

	for (var permName in permissionsOrder) {
		if (!permissionsOrder.hasOwnProperty(permName)) continue;
		var matchScore = Util.getMatchStrength(permName, str);

		if (matchScore > matchTop) {
			matchTop = matchScore;
			matchPerm = permName;
		}
	}

	return matchPerm;
};

exports.setChannelPerms = function(channel, userOrRole, newPerms) {
	channel.overwritePermissions(userOrRole, newPerms)
	.catch(error => console.log("\n[E_SetChannelPerms] " + error));
};

exports.query = function(msg, speaker, channel, func) {
	var qNum = "[" + nQ + "]";
	var qMsg = qNum + " " + msg;
	Util.print(channel, qMsg);
	queries.push([qNum, speaker.id, func, qMsg]);
	nQ++;
};

// fetch more messages just like Discord client does
exports.fetchMessagesEx = function(channel, left, store, last) {
	// message cache is sorted on insertion
	// channel.messages[0] will get oldest message
	if (last) last = last.id;
	return channel.fetchMessages({limit: Math.min(left, 100), before: last})
		.then(messages => exports.onFetch(messages, channel, left, store));
};

exports.onFetch = function(messages, channel, left, store) {
	messages = messages.array();
	if (!messages.length) return Promise.resolve();
	for (var i = 0; i < messages.length; i++) {
		store.push(messages[i]);
	}
	left -= messages.length;
	console.log(`Received ${messages.length}, left: ${left}`);
	if (left <= 0) return Promise.resolve();
	return exports.fetchMessagesEx(channel, left, store, messages[messages.length-1]);
};

exports.updateMessageCache = function(channel, speaker) {
	exports.fetchMessagesEx(channel, 100, [], channel.messages[0]).then(() => {
		if (speaker) {
			Util.sendDescEmbed(channel, "Message Cache", "Refreshed", Util.makeEmbedFooter(speaker), null, 0x00E676);
		}
	});
}