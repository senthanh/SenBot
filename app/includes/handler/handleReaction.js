module.exports = function ({ api, models, Users, Threads, Currencies, logger }) {
    return function ({ event }) {
        const { handleReaction, commands } = global.client;
        const { messageID, threadID } = event;
        if (handleReaction.length == 0) return;
        const findIndex = handleReaction.findIndex(e => e.messageID == messageID);
        if (findIndex < 0) return;
        const dataNeedHandle = handleReaction[findIndex];
        const handleNeedExec = commands.get(dataNeedHandle.name);

        if (!handleNeedExec) return api.sendMessage('Missing data for handling reaction!', threadID, messageID);
        try {
            handleNeedExec.handleReaction({ api, event, models, Users, Threads, Currencies, handleReaction: dataNeedHandle });
            return;
        } catch (error) {
            logger.error(`REACTION > ${dataNeedHandle.name}:`);
            console.log(error);
            return api.sendMessage('An error occurred while handling reaction!', threadID, messageID);
        }
    };
};