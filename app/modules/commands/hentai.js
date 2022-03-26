module.exports.config = {
	name: "hentai",
	version: "1.0.0",
	hasPermssion: 0,
	credits: "SenProject",
	description: "Hentai pic/gif from nekos.life",
	group: "media",
	usages: "[key]",
	cooldowns: 5,
	dependencies: {
		"axios": "",
	}
};

module.exports.run = async function({ api, event, args }) {
	const { threadID, messageID } = event;

	if (!global.data.threadAllowNSFW.includes(threadID) && !global.data.allUserID.includes(threadID))
		return api.sendMessage("This group does not allow NSFW.", threadID, messageID);

	const { get } = global.nodemodule['axios'];
	const { hentai } = global.assets;
	const key = args.join(" ");

	const allKeys = Object.keys(hentai);
	if (!key) return api.sendMessage("Please enter a key!", threadID, messageID);
	if (!allKeys.includes(key)) return api.sendMessage(`This key doesn't exist!\nAvailable keys:\n${allKeys.join(", ")}`, threadID, messageID);

	try {
		const { data } = await get(`https://nekos.life/api/v2${hentai[key]}`);
		const imageStream = await get(encodeURI(data.url), { responseType: 'stream' });
		return api.sendMessage({
			attachment: imageStream.data
		}, threadID, messageID);
		
	} catch (e) {
		console.log(e);
		return api.sendMessage("Something went wrong!", threadID, messageID);
	}
}