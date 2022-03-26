module.exports.config = {
	name: "user",
	version: "1.0.0",
	hasPermssion: 2,
	credits: "SenProject",
	description: "Manage, ban, unban users",
	usages: "[ban/unban] [list/userID/@tag]",
	group: "System",
	cooldowns: 5
};

module.exports.run = async function ({ api, event, args, Users }) {
	const { threadID, messageID, mentions } = event;
	const { getAll, getData, setData } = Users;
	
    if (!args.length) return api.sendMessage("Missing arguments!", threadID, messageID);
    const mention = Object.keys(mentions);

	var msg,
		targetUID = mention.length ? mention : args.slice(1),
		userSettings,
        succeed = [],
        failed = [];

	if (args[0] == "ban") {
		if (targetUID[0] == "list") {
			// List all banned users with name
			msg = "**Banned Users**\n";
			const allUser = await getAll();
			let num = 1;
			for (const user of allUser) {
				const { userID, name, data } = user;
				if (data && data.banned)
					msg += `${num++}. ${name} (${userID})\n`;
			}

            if (msg == "**Banned Users**\n") msg = "No banned users!";
			return api.sendMessage(msg, threadID, messageID);
		}

        for (const user of targetUID) {
            userSettings = await getData(user) || {};

            if (isNaN(parseInt(user)) || userSettings.data.banned) failed.push(user);
            else {
                userSettings.data.banned = true;
                global.data.userBanned.push(user);
                await setData(user, userSettings);
                succeed.push(user);
            }
        }

        msg = `Successfully banned ${succeed.length} users!`;
	}
	else if (args[0] == "unban") {
        for (const user of targetUID) {
            userSettings = await getData(user) || {};

            if (isNaN(parseInt(user)) || !userSettings.data.banned) failed.push(user);
            else {
                userSettings.data.banned = false;
                global.data.userBanned.splice(global.data.userBanned.indexOf(user), 1);
                await setData(user, userSettings);
                succeed.push(user);
            }
        }
        
        msg = `Successfully unbanned ${succeed.length} users!`;
	}
	else msg = "Invalid arguments!";

    if (failed.length > 0) msg += `\nAction failed on ${failed.length} users!\n${failed.map((user, index) => `${index+1}/ ${user}\n`).join("")}`;
	return api.sendMessage(msg, threadID, () => setData(targetUID, userSettings), messageID);
}