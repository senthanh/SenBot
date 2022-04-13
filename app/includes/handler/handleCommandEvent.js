module.exports = function ({ api, models, Users, Threads, Currencies, logger }) {
    return function ({ event }) {
        const { allowInbox } = global.config;
        const { userBanned, threadBanned } = global.data;
        const { commands, eventRegistered } = global.client;
        var { senderID, threadID } = event;
        var senderID = String(senderID);
        var threadID = String(threadID);
        if (userBanned.includes(senderID) || threadBanned.includes(threadID) || allowInbox && senderID == threadID) return;
        for (const eventReg of eventRegistered) {
            const command = commands.get(eventReg);
            try {
                if (command) command.handleEvent({ api, event, models, Users, Threads, Currencies });
            } catch (error) {
                logger.error(`COMMAND EVENT > ${command.config.name}:`);
                console.log(error);
            }
        }
    };
};
