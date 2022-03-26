module.exports.config = {
    name: "work",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "SenProject",
    description: "Work to earn money.",
    group: "Economy",
    cooldowns: 5,
    additionalConfig: {
        cooldownTime: 1200000
    }
};

module.exports.run = async ({ event, api, Currencies }) => {
    const { threadID, messageID, senderID } = event;
    const { increaseMoney, getData, setData } = Currencies;

    const cooldown = global.configModule[this.config.name].cooldownTime;

    var data = (await getData(senderID)).data || {},
        msg = '';

    if (data.hasOwnProperty('work') && cooldown - (Date.now() - data.work) > 0) {
        const timeLeft = ((cooldown - (Date.now() - data.work)) / 1000).toFixed(0);

        //Convert seconds to hours, minutes, seconds
        const hours = Math.floor(timeLeft / 3600),
            minutes = Math.floor((timeLeft - (hours * 3600)) / 60),
            seconds = timeLeft - (hours * 3600) - (minutes * 60);

        //if lower than 10, add a 0 in front
        const hoursString = hours < 10 ? '0' + hours : hours,
            minutesString = minutes < 10 ? '0' + minutes : minutes,
            secondsString = seconds < 10 ? '0' + seconds : seconds;

        const timeString = `${hoursString}:${minutesString}:${secondsString}`;
        msg += `You can work again in ${timeString}!`;

        return api.sendMessage(msg, threadID, messageID);
    }
    else {
        const amount = getRandomInt(100, 600);
        msg += `You worked and earned ${amount} SEN!`;

        return api.sendMessage(msg, threadID, async () => {
            await increaseMoney(senderID, parseInt(amount));
            data.workTime = Date.now();
            await setData(senderID, { data });
            return;
        }, messageID);
    }

    //function to random from min to max
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}