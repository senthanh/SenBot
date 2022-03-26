module.exports.config = {
    name: "adminUpdate",
    eventType: ["log:thread-admins", "log:thread-name", "log:user-nickname", "log:thread-icon", "change_thread_image", "log:thread-call"],
    version: "1.0.0",
    credits: "SenProject",//inspire by miraibot
    description: "GROUP UPDATE NOTIFICATION"
};

module.exports.run = async function ({ event, api, Threads, Users }) {
    const { author, threadID, logMessageType, logMessageData } = event;
    const { setData, getData } = Threads;

    if (author == threadID) return;
    
    try {
        let dataThread = (await getData(threadID)).threadInfo;
        switch (logMessageType) {
            case "log:thread-admins": {
                if (logMessageData.ADMIN_EVENT == "add_admin") {
                    dataThread.adminIDs.push({ id: logMessageData.TARGET_ID })
                    api.sendMessage(`» [ GROUP UPDATE ]\n» ADDED USER ${logMessageData.TARGET_ID} TO GROUP ADMIN.`, threadID);
                }
                else if (logMessageData.ADMIN_EVENT == "remove_admin") {
                    dataThread.adminIDs = dataThread.adminIDs.filter(item => item.id != logMessageData.TARGET_ID);
                    api.sendMessage(`» [ GROUP UPDATE ]\n» REMOVED ADMIN PRIVILEGES OF ${logMessageData.TARGET_ID}.`, threadID);
                }
                break;
            }

            case "log:user-nickname": {
                dataThread.nicknames[logMessageData.participant_id] = logMessageData.nickname;
                api.sendMessage(`» [ GROUP UPDATE ]\n» ${(logMessageData.nickname.length == 0) ? `REMOVED NICKNAME OF ${logMessageData.participant_id}` : `UPDATED NICKNAME OF ${logMessageData.participant_id} TO: ${logMessageData.nickname}`}.`, threadID);
                break;
            }

            case "log:thread-name": {
                dataThread.threadName = event.logMessageData.name || null;
                api.sendMessage(`» [ GROUP UPDATE ]\n» ${(dataThread.threadName) ? `UPDATED GROUP NAME TO ${dataThread.threadName}` : 'REMOVED GROUP NAME'}.`, threadID);
                break;
            }

            case "log:thread-icon": {
                dataThread.threadIcon = event.logMessageData.thread_icon || "👍";
                api.sendMessage(`» [ GROUP UPDATE ]\n» UPDATED GROUP EMOJI TO ${dataThread.threadIcon},`, threadID);
                break;
            }

            case "change_thread_image": {
                api.sendMessage(`» [ GROUP UPDATE ]\n» ${author} UPDATED GROUP IMAGE.`, threadID);
                break;
            }

            case "log:thread-call": {
                if (logMessageData.event == "group_call_started") {
                    const name = await Users.getNameUser(logMessageData.caller_id);
                    api.sendMessage(`» [ GROUP UPDATE ]\n» ${name} STARTED A ${(logMessageData.video) ? 'VIDEO ' : ''}CALL.`, threadID);
                }
                else if (logMessageData.event == "group_call_ended") {
                    const callDuration = logMessageData.call_duration;

                    //Transform seconds to hours, minutes and seconds
                    let hours = Math.floor(callDuration / 3600);
                    let minutes = Math.floor((callDuration - (hours * 3600)) / 60);
                    let seconds = callDuration - (hours * 3600) - (minutes * 60);

                    //Add 0 if less than 10
                    if (hours < 10) hours = "0" + hours;
                    if (minutes < 10) minutes = "0" + minutes;
                    if (seconds < 10) seconds = "0" + seconds;

                    const timeFormat = `${hours}:${minutes}:${seconds}`;

                    api.sendMessage(`» [ GROUP UPDATE ]\n» ${(logMessageData.video) ? 'VIDEO ' : ''}CALL HAS ENDED.\n» CALL DURATION: ${timeFormat}`, threadID);
                    
                }
                else if (logMessageData.joining_user) {
                    const name = await Users.getNameUser(logMessageData.joining_user);
                    api.sendMessage(`» [ GROUP UPDATE ]\n» ${name} JOINED THE ${(logMessageData.group_call_type == '1') ? 'VIDEO ' : ''}CALL.`, threadID);
                }
                break;
            }
        }
        await setData(threadID, { threadInfo: dataThread });
    } catch (e) { console.log(e); };
}