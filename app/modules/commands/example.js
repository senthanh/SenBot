module.exports.config = {
	name: "nameCommand", // name of the command
	version: "version", // version of the command
	hasPermssion: 0/1/2, // command permission, 0: all, 1: group admins, 2: bot admins
	credits: "Name need credit", // The owner of this command
	description: "say bla bla ở đây", // Describe command here
	group: "group", // A group of command, you can use this to make command to be under one category
	usages: "[option] [text]", // How to use this command? describe here
	cooldowns: 3, // Cooldown till next use
	dependencies: {
		"packageName": "version"
	}, // Dependencies need for command
	additionalConfig: {
		// Setup command config here
	}
};

module.exports.onLoad = function ({ configValue }) {
	//CODE HERE
}

module.exports.handleReaction = function({ api, event, models, Users, Threads, Currencies, handleReaction }) {
	//CODE HERE
}

module.exports.handleReply = function({ api, event, models, Users, Threads, Currencies, handleReply }) {
	//CODE HERE
}

module.exports.handleEvent = function({ event, api, models, Users, Threads, Currencies }) {
	//CODE HERE
}

module.exports.run = function({ api, event, args, models, Users, Threads, Currencies, permssion }) {
	//CODE HERE
}