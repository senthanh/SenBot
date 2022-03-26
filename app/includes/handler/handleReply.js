module.exports = function ({ api, models, Users, Threads, Currencies, logger }) {
    return function ({ event }) {
        if (!event.messageReply) return;
        const { handleReply, commands } = global.client
        const { messageID, threadID, messageReply } = event;
        if (handleReply.length !== 0) {
            const findIndex = handleReply.findIndex(e => e.messageID == messageReply.messageID);
            if (findIndex < 0) return;
            const dataNeedHandle = handleReply[findIndex];
            const handleNeedExec = commands.get(dataNeedHandle.name);
            if (!handleNeedExec) return api.sendMessage('Missing data for handling reply!', threadID, messageID);
            try {
                handleNeedExec.handleReply({ api, event, models, Users, Threads, Currencies, handleReply: dataNeedHandle });
                return;
            } catch (error) {
                logger.error(`REPLY > ${dataNeedHandle.name}:`);
                console.log(error);
                return api.sendMessage('An error occurred while handling reply!', threadID, messageID);
            }
        }
    };
}