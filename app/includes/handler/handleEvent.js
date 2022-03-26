module.exports = function ({api ,models, Users, Threads, Currencies, logger }) {
   	const moment = require("moment");

    return function ({ event }) {
        const timeStart = Date.now()
        const time = moment.tz("Asia/Ho_Chi_minh").format("hh:mm:ss DD/MM/YYYY");
        const { userBanned, threadBanned } = global.data;
        const { events } = global.client;
        const { allowInbox, DeveloperMode } = global.config;
        var { senderID, threadID } = event;
        senderID = String(senderID);
        threadID = String(threadID);
        if (userBanned.includes(senderID) || threadBanned.includes(threadID) || !allowInbox && senderID == threadID) return;
        for (const [key, value] of events.entries()) {
            if (!event.hasOwnProperty("logMessageType") && event.type == "change_thread_image")
                event.logMessageType = "change_thread_image";
            if (value.config.eventType.indexOf(event.logMessageType) !== -1) {
                const eventRun = events.get(key);
                try {
                    eventRun.run({ api, event, models, Users, Threads, Currencies });
                    if (DeveloperMode)
                    logger.dev(`EVENT > ${time} | ${threadID} | ${eventRun.config.name} | ${event.logMessageType} | ${event.logMessageBody} | ${Date.now() - timeStart}ms`);
                } catch (error) {
                    logger.error(`An error occurred > events > ${eventRun.config.name}:`);
                    console.log(error);
                }
            }
        }
        return;
    };
}