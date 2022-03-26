module.exports.config = {
	name: "nsfw",
	version: "1.0.0",
	hasPermssion: 1,
	credits: "SenProject",
	description: "Turn on/off nsfw on group.",
	group: "Group",
	usages: "[on/off]",
	cooldowns: 5
};

module.exports.run = async function ({ api, event, args, Threads }) {
	const { threadID, messageID } = event;
	const { threadAllowNSFW, allUserID } = global.data;

	if (allUserID.includes(threadID)) return api.sendMessage("You can only use this command in group.", threadID, messageID);

	const { getData, setData } = Threads;
	const threadSetting = await getData(threadID) || {};

	var msg,
		threadIndex = threadAllowNSFW.findIndex(item => item == threadID);
	
	if (!args.length) {
		if (threadIndex == -1) {
			threadSetting.data.NSFW = true;
			global.data.threadAllowNSFW.push(threadID);
			msg = "NSFW is now enabled.";
		} else {
			threadSetting.data.NSFW = false;
			global.data.threadAllowNSFW.splice(threadIndex, 1);
			msg = "NSFW is now disabled.";
		}
	} else if (args[0] == "on") {
		if (threadIndex == -1) {
			threadSetting.data.NSFW = true;
			global.data.threadAllowNSFW.push(threadID);
			msg = "NSFW is now enabled.";
		} else {
			msg = "NSFW is already enabled.";
		}
	} else {
		if (threadIndex == -1) {
			msg = "NSFW is already disabled.";
		} else {
			threadSetting.data.NSFW = false;
			global.data.threadAllowNSFW.splice(threadIndex, 1);
			msg = "NSFW is now disabled.";
		}
	}

	return api.sendMessage(msg, threadID, () => setData(threadID, threadSetting), messageID);
}