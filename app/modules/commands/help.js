module.exports.config = {
	name: "help",
	version: "1.0.0",
	hasPermssion: 0,
	credits: "SenProject",
	description: "A list of commands and their descriptions.",
	group: "general",
	usages: "[command_name]",
	cooldowns: 5
};


module.exports.run = function({ api, event, args }) {
	const { commands } = global.client;
	const { threadID, messageID } = event;
	const command = commands.get((args[0] || "").toLowerCase());
	const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
	const prefix = threadSetting.PREFIX || global.config.PREFIX;

	var msg = '';

	if (!command) {
		var groups = [];
		for (const value of commands.values()) {
			let { name, group } = value.config;
			if (!groups.some(item => item.group == group)) groups.push({ group, cmds: [name] });
			else groups.find(item => item.group == group).cmds.push(name);
		}
		
		groups.forEach(commandGroup => msg += `[ ${commandGroup.group.toUpperCase()} ]\n${commandGroup.cmds.join(', ')}\n\n`);
		msg += `There are ${commands.size} commands in total.`;
		msg += `\nUse ${prefix}help [command_name] for more information on a specific command.`;
		return api.sendMessage({
			body: msg,
			attachment: global.assets.images.help
		}, threadID);

	}

	const { name, version, hasPermssion, credits, description, group, usages, cooldowns } = command.config;
	
	msg += `**${name}**\n`;
	msg += `Version: ${version}\n`;
	msg += `Credits: ${credits}\n`;
	msg += `Description: ${description}\n`;
	msg += `Group: ${group}\n`;
	msg += `Usage: ${prefix}${name} ${usages}\n`;
	msg += `Permission: ${hasPermssion == 0 ? "Everyone" : hasPermssion == 1 ? "GroupAdmins" : "BotAdmins"}\n`;
	msg += `Cooldown: ${cooldowns} seconds\n`;

	return api.sendMessage(msg, threadID, messageID);
}