module.exports.config = {
    name: "join",
    eventType: ["log:subscribe"],
    version: "1.0.0",
    credits: "SenProject",
    description: "JOIN NOTIFICAITON"
};

module.exports.run = async function ({ api, event, Users }) {
    const { threadID } = event;
    if (event.logMessageData.addedParticipants.some(u => u.userFbId == global.data.botID)) {
        api.changeNickname(` [ ${global.config.PREFIX} ] ${(!global.config.BOTNAME) ? "SenBot" : global.config.BOTNAME}`, threadID, global.data.botID);
        return api.sendMessage(`» CONNECTED!\nUse ${global.config.PREFIX}help to get commands list!`, threadID);
    } else {
        try {
            let { threadName } = await api.getThreadInfo(threadID);

            // TODO:
            // Add a check for join notification
            // if (typeof thread.joinNoti != "undefined" && !thread.joinNoti) return;
            // Custom join message


            var mentions = [],
                nameArray = [],
                msg;
                attachment = global.assets.images.join;

            const { addedParticipants } = event.logMessageData;

            for (id in addedParticipants) {
                const userName = addedParticipants[id].fullName || "Facebook User";
                nameArray.push(userName);
                mentions.push({ tag: userName, id });

                if (!global.data.allUserID.includes(id)) {
                    await Users.createData(id, { name: userName, data: {} });
                    global.data.userName.set(id, userName);
                    global.data.allUserID.push(id);
                }
            }

            msg = "Welcome to {threadName}\n{name}"
                .replace(/\{name}/g, nameArray.join(', '))
                .replace(/\{threadName}/g, threadName || "this group");



            return api.sendMessage({ body: msg, mentions, attachment }, threadID);
        } catch (e) { throw e };
    }
}