module.exports.config = {
    name: "balance",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "SenProject",
    description: "Check your/someone's balance.",
    group: "Economy",
    usages: "@mention",
    cooldowns: 5
}

module.exports.run = async ({ event, api, Currencies }) => {
    const { getData } = Currencies;
    const { threadID, messageID, senderID, mentions } = event;
    const mention = Object.keys(mentions);
    
    if (!mention.length) {
        const { money } = await getData(senderID);
        if (isNaN(money) || money == null || money == 0) return api.sendMessage("You don't have any money!", threadID, messageID);
        return api.sendMessage(`Your balance: ${money} SEN`, threadID, messageID);
    }
    else if (mention.length > 1) return api.sendMessage("You can't mention more than 1 person!", threadID, messageID);
    else {
        const { money } = await getData(mention[0]);
        if (isNaN(money) || money == null || money == 0) return api.sendMessage("This person doesn't have any money!", threadID, messageID);
        return api.sendMessage(`${mentions[mention[0]].replace(/@/g,"")}'s balance: ${money} SEN`, threadID, messageID);
    }
}