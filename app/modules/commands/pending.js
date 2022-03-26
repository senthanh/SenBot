module.exports.config = {
	name: "pending",
	version: "1.0.0",
	hasPermssion: 2,
	credits: "SenProject",
	description: "Manage pending group",
	group: "System",
	cooldowns: 5
};

module.exports.handleReply = async function({ api, event, handleReply }) {
    const { threadID, messageID, senderID, body } = event;
    if (senderID != handleReply.author || !body) return;
    var succeed = [],
        failed = [];

    if (isNaN(body) && body.indexOf("r") == 0 || body.indexOf("reject") == 0) {
        const bodySplit = body.split(" ").slice(1);
        if (bodySplit.length == 0) return api.sendMessage("Invalid arguments!", threadID, messageID);

        api.unsendMessage(handleReply.messageID);

        //trim all element on bodySplit and parseInt
        const bodySplitParse = bodySplit.map(element => parseInt(element.trim()));

        //loop all element on bodySplit using for loop
        for (const element of bodySplitParse) {
            if (isNaN(element)) continue;
            const group = handleReply.pending[element-1];
            if (!group) {
                failed.push(group);
                continue;
            }
            try {
                await api.removeUserFromGroup(global.data.botID, group.threadID);
                succeed.push(group);
            } catch (e) {
                console.log(e);
                failed.push(group);
            }
        }

        msg = `**${succeed.length} group(s) rejected!**\n`;
    }
    else {
        const bodySplit = body.split(" ");

        api.unsendMessage(handleReply.messageID);

        //trim all element on bodySplit and parseInt
        const bodySplitParse = bodySplit.map(element => parseInt(element.trim()));

        //loop all element on bodySplit using for loop
        for (const element of bodySplitParse) {
            if (isNaN(element)) continue;
            const group = handleReply.pending[element-1];
            if (!group) {
                failed.push(group);
                continue;
            }
            try {
                api.sendMessage('Group approved!\nYou can now use bot in this group.', group.threadID);
                succeed.push(group);
            } catch (e) {
                console.log(e);
                failed.push(group);
            }
        }

        msg = `**${succeed.length} group(s) approved!**\n`;
    }
    if (failed.length > 0) msg += `Action failed on ${failed.length} group(s).\n${failed.map((group, index) => `${index+1}/ ${group.name}(${group.threadID})\n`).join("")}`;
    
    return api.sendMessage(msg, threadID, messageID);
}

module.exports.run = async function({ api, event }) {
	const { threadID, messageID, senderID } = event;
    var msg = "";

    try {
		var spam = await api.getThreadList(100, null, ["OTHER"]) || [];
		var pending = await api.getThreadList(100, null, ["PENDING"]) || [];
	} catch (e) {
        return api.sendMessage("Can't get pending list!", threadID, messageID);
    }

	const list = [...spam, ...pending].filter(group => group.isSubscribed && group.isGroup);
    const listLength = list.length;

    if (listLength == 0) return api.sendMessage("No pending group!", threadID, messageID);

    msg += `**${listLength} pending group(s)**\n`;
    msg += list.map((group, index) => `${index+1}/ ${group.name}(${group.threadID})\n`).join("");
    msg += `\nReply with a number(s) to approve or reject group(s).\n`;


    return api.sendMessage(msg, threadID, (error, info) => {
		global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: senderID,
            pending: list
        })
	}, messageID);
}