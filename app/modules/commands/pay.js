module.exports.config = {
    name: "pay",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "SenProject",
    description: "Transfer money to someone",
    group: "Economy",
    usages: "@mention [amount]",
    cooldowns: 5
};

module.exports.run = async ({ event, api, Currencies, args }) => {
    let { threadID, messageID, senderID, mentions } = event;
    const mention = Object.keys(mentions);
    let name = mentions[mention].split(" ").length;
    if (!mention) return api.sendMessage('Please mention someone you want to pay!', threadID, messageID);
    if (mention.length > 1) return api.sendMessage('You can only mention 1 person!', threadID, messageID);
    else {
        if (!global.data.allCurrenciesID.includes(senderID)) return api.sendMessage('You are not in the database!', threadID, messageID);
        if (!global.data.allCurrenciesID.includes(mention[0])) return api.sendMessage('This person is not in the database!', threadID, messageID);
        if (!isNaN(args[name])) {
            const money = parseInt(args[name]);
            let balance = (await Currencies.getData(senderID)).money;
            if (money <= 0 || isNaN(money) || money == null) return api.sendMessage('Amount not valid.', threadID, messageID);
            if (money > balance) return api.sendMessage('Balance not enough.', threadID, messageID);
            else {
                return api.sendMessage({ body: 'Successfully paid to ' + mentions[mention].replace(/@/g, "") + ` ${args[name]} SEN` }, threadID, async () => {
                    await Currencies.increaseMoney(mention, money);
                    Currencies.decreaseMoney(senderID, money)
                }, messageID);
            }
        } else return api.sendMessage('Please enter amount.', threadID, messageID);
    }
}