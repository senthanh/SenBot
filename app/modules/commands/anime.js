module.exports.config = {
	name: "anime",
	version: "1.0.0",
	hasPermssion: 0,
	credits: "SenProject",
	description: "Anime pic/gif from nekos.life",
	usages: "[key]",
	group: "media",
	cooldowns: 5,
	dependencies: {
		"axios": "",
	}
};

module.exports.run = async function({ api, event, args }) {
	const { threadID, messageID } = event;
	const { get } = global.nodemodule['axios'];
	const { anime } = global.assets;
	const key = args.join(" ");

	const allKeys = Object.keys(anime);
	if (!key) return api.sendMessage("Please enter a key!", threadID, messageID);
	if (!allKeys.includes(key)) return api.sendMessage(`This key doesn't exist!\nAvailable keys:\n${allKeys.join(", ")}`, threadID, messageID);

	try {
		const { data } = await get(`https://nekos.life/api/v2${anime[key]}`);
		const imageStream = await get(encodeURI(data.url), { responseType: 'stream' });
		return api.sendMessage({
			attachment: imageStream.data
		}, threadID, messageID);
		
	} catch (e) {
		console.log(e);
		return api.sendMessage("Something went wrong!", threadID, messageID);
	}
}