module.exports.config = {
    name: "leave",
    eventType: ["log:unsubscribe"],
    version: "1.0.0",
    credits: "SenProject",
    description: "LEAVE NOTIFICATION"
};


module.exports.run = async function ({ api, event, Users, Threads }) {
    if (event.logMessageData.leftParticipantFbId == global.data.botID) return;
    const { threadID } = event;

    
    // TODO:
    // Add a check for leave notification
    // const thread = global.data.threadData.get(threadID) || {};
    // if (typeof thread.leaveNoti != "undefined" && !thread.leaveNoti) return;
    // Optimize leave message
    // const type = (event.author == event.logMessageData.leftParticipantFbId) ? "left" : "kicked";
    // Custom leave message


    const name = global.data.userName.get(event.logMessageData.leftParticipantFbId) || await Users.getNameUser(event.logMessageData.leftParticipantFbId) || "Facebook User";
    var msg,
        attachment = global.assets.images.leave;

    msg = "Goodbye {name}, hope to see you back soon!"
        .replace(/\{name}/g, name)

    return api.sendMessage({ body: msg, attachment }, threadID);
}