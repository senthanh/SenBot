module.exports.config = {
	name: "restart",
	version: "1.0.0",
	hasPermssion: 2,
	credits: "SenProject",
	description: "Restart Bot.",
	group: "system"
};

module.exports.run = ({ event, api }) => api.sendMessage("Restarting...", event.threadID, () => process.exit(1))