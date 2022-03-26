module.exports.config = {
	name: "thread",
	version: "1.0.0",
	hasPermssion: 2,
	credits: "SenProject",
	description: "Manage, ban, unban threads",
	usages: "[ban/unban] [list/threadID]",
	group: "System",
	cooldowns: 5
};

module.exports.run = async function ({ api, event, args, Threads }) {
	const { threadID, messageID } = event;
	const { getAll, getData, setData } = Threads;
	
	if (!args.length) return api.sendMessage("Missing arguments!", threadID, messageID);

	var msg,
		targetTID = args[1] || threadID,
		threadSetting;

	if (args[0] == "ban") {
		if (targetTID == "list") {
			// List all banned threads with name
			msg = "**Banned Threads**\n";
			const allThread = await getAll();
			let num = 1;
			for (const thread of allThread) {
				const { data, threadInfo } = thread;
				if (data.banned)
					msg += `${num++}. ${threadInfo.threadName} (${threadInfo.threadID})\n`;
			}
			return api.sendMessage(msg, threadID, messageID);
		}
		
		threadSetting = await getData(targetTID) || {};

		if (isNaN(parseInt(targetTID))) msg = "Invalid threadID!";
		else if (threadSetting.data.banned) msg = "This thread is already banned!";
		else {
			threadSetting.data.banned = true;
			global.data.threadBanned.push(targetTID);
			msg = "Successfully banned!";
		}
	}
	else if (args[0] == "unban") {
		threadSetting = await getData(targetTID) || {};

		if (isNaN(parseInt(targetTID))) msg = "Invalid threadID!";
		else if (!threadSetting.data.banned) msg = "This thread is not banned!";
		else {
			threadSetting.data.banned = false;
			global.data.threadBanned.splice(global.data.threadBanned.indexOf(targetTID), 1);
			msg = "Successfully unbanned!";
		}
	}
	else msg = "Invalid arguments!";
	return api.sendMessage(msg, threadID, () => setData(targetTID, threadSetting), messageID);
}