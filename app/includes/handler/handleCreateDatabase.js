module.exports = function ({ models, Users, Threads, Currencies, logger }) {
    return async function ({ event }) {
        const { allUserID, allCurrenciesID, allThreadID, userName, threadInfo } = global.data;
        const { autoCreateDB } = global.config;
        if (!autoCreateDB) return;
        var { senderID, threadID } = event;
        senderID = String(senderID);
        var threadID = String(threadID);
        try {
            if (!allThreadID.includes(threadID) && event.isGroup) {
                const curThreadInfo = (await Threads.getInfo(threadID));
                const { threadName, adminIDs, nicknames } = curThreadInfo;
                const dataThread = {
                    threadName,
                    adminIDs,
                    nicknames
                };
                allThreadID.push(threadID);
                threadInfo.set(threadID, dataThread);
                await Threads.setData(threadID, { threadInfo: dataThread, data: {} });
                for (const user of curThreadInfo.userInfo) {
                    userName.set(String(user.id), user.name);
                    try {
                        if (global.data.allUserID.includes(String(user.id))) {
                            await Users.setData(String(user.id), { name: user.name });
                            global.data.allUserID.push(String(user.id));
                        } else {
                            await Users.createData(String(user.id), { name: user.name, data: {} });
                            global.data.allUserID.push(String(user.id));
                            logger.database(`Create user > ${user.id}`);
                        }
                    } catch (e) { logger.error(e) };
                }
                logger.database(`Create thread > ${threadID}`);
            }
            if (!allUserID.includes(senderID) || !userName.has(senderID)) {
                const infoUser = await Users.getInfo(senderID);
                await Users.createData(senderID, { name: infoUser.name });
                allUserID.push(senderID);
                userName.set(senderID, infoUser.name);
                logger.database(`Create user > ${senderID}`);
            }
            if (!allCurrenciesID.includes(senderID)) {
                await Currencies.createData(senderID, { data: {} })
                allCurrenciesID.push(senderID);
            }
            return;
        } catch (err) {
            logger.error('Error while handling auto create database:');
            console.log(err);
        }
    };
}