module.exports.config = {
    name: "trade",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "SenProject",
    description: "Trade and earn.",
    group: "Economy",
    usages: "[amount]",
    cooldowns: 10,
    additionalConfig: {
        minTrade: 100
    }
}

module.exports.run = async ({ event, api, Currencies, args }) => {
    const { threadID, messageID, senderID } = event;
    const { increaseMoney, decreaseMoney, getData } = Currencies;
    const { minTrade } = global.configModule[this.config.name];

    if (!global.data.allCurrenciesID.includes(senderID)) return api.sendMessage('You are not in the database!', threadID, messageID);

    const data = await getData(senderID) || {};
    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 1 || amount == null) return api.sendMessage("You must enter a valid amount!", threadID, messageID);
    if (amount > data.money) return api.sendMessage("You don't have enough money!", threadID, messageID);
    if (amount < minTrade) return api.sendMessage(`You must enter an amount equal or greater than ${minTrade}!`, threadID, messageID);

    const trade = getRandomInt(1, 100);
    const tradeWinPercent = getRandomInt(20, 300);
    const tradeLosePercent = getRandomInt(10, 100);
    
    // trade lower than 50 = lose
    if (trade < 50) {
        const loseAmount = Math.floor(amount * (tradeLosePercent / 100));
        api.sendMessage(`You lost ${loseAmount} SEN!`, threadID, async () => {
            await decreaseMoney(senderID, loseAmount);
        }, messageID);
    } else {
        const winAmount = Math.floor(amount * (tradeWinPercent / 100));
        api.sendMessage(`You won ${winAmount} SEN!`, threadID, async () => {
            await increaseMoney(senderID, winAmount);
        }, messageID);
    }

    //function to random from min to max
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}