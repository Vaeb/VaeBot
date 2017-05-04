module.exports = Cmds.addCommand({
	cmds: [";img ", ";image "],

	requires: {
		guild: false,
		loud: false
	},

	desc: "Output an image for a word/phrase using Google",

	args: "([keyword])",

	example: "puppy",

	func: (cmd, args, msgObj, speaker, channel, guild) => {
		var searchStart = Util.getRandomInt(1, 20);
		var searchURL = "https://www.googleapis.com/customsearch/v1?q=" + args + "&num=1&start=" + searchStart + "&searchType=image&key=AIzaSyBNXuJaoDMdnlLFxZ20ykf68gT2Qk4eG4s&cx=003838813173771542491%3A0bxpubr42jq";
		
		index.Request(searchURL, function(error, response, body) {
			if (error) {
				console.log("[HTTP] " + error);
			} else {
				var bodyData = JSON.parse(body);
				if (bodyData.hasOwnProperty("items")) {
					var imgURL = bodyData.items[0].link;
					// console.log(imgURL);
					Util.print(channel, imgURL);
				} else {
					Util.print(channel, "No image found");
				}
			}
		});
	}
});