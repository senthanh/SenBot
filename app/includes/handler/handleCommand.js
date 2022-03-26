module.exports = function ({ api, models, Users, Threads, Currencies, logger }) {
  const stringSimilarity = require('string-similarity'),
    escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return async function ({ event }) {
    const timeNow = Date.now();
    const { PREFIX, ADMINBOT, DeveloperMode, allowInbox } = global.config;
    const { userBanned, threadBanned, threadInfo, threadData } = global.data;
    const { commands, cooldowns } = global.client;
    var { body, senderID, threadID, messageID } = event;
    var senderID = String(senderID),
      threadID = String(threadID);
    const threadSetting = threadData.get(threadID) || {}
    const prefixRegex = new RegExp(`^(<@!?${senderID}>|${escapeRegex((threadSetting.hasOwnProperty("PREFIX")) ? threadSetting.PREFIX : PREFIX)})\\s*`);
    if (!prefixRegex.test(body)) return;

    if (userBanned.includes(senderID) || threadBanned.includes(threadID) || !allowInbox && senderID == threadID) {
      if (!ADMINBOT.includes(senderID.toString())) {
        if (userBanned.includes(senderID)) return;
        else if (threadBanned.includes(threadID)) return;
      }
    }

    const matchedPrefix = body.match(prefixRegex),
      args = body.slice(matchedPrefix.length).trim().split(/ +/);
    commandName = args.shift().toLowerCase();
    var command = commands.get(commandName);

    if (!command) {
      var allCommandName = [];
      const commandValues = commands.keys();
      for (const cmd of commandValues) allCommandName.push(cmd)
      const checker = stringSimilarity.findBestMatch(commandName, allCommandName);
      if (checker.bestMatch.rating >= 0.4) command = commands.get(checker.bestMatch.target);
      else return api.sendMessage('Command not found!', threadID);
    }

    var curThreadInfo;
    if (event.isGroup)
      try {
        curThreadInfo = (threadInfo.get(threadID) || await Threads.getInfo(threadID))
        if (Object.keys(curThreadInfo).length == 0) throw 'Can not get thread info!';
      } catch (e) {
        logger.error(e);
      }


    //GET NECESSARY DATA
    curThreadInfo = (threadInfo.get(threadID) || await Threads.getInfo(threadID));
    const findSenderInAdminIDs = curThreadInfo.adminIDs.find(el => el.id == senderID);

    //CHECK PERMISSION
    var permssion = 0;
    if (ADMINBOT.includes(senderID.toString())) permssion = 2;
    else if (!ADMINBOT.includes(senderID) && findSenderInAdminIDs) permssion = 1;

    if (command.config.hasPermssion > permssion) return api.sendMessage('Can\'t use this command!', threadID, messageID);

    //CHECK COOLDOWN
    if (!cooldowns.has(command.config.name)) cooldowns.set(command.config.name, new Map());
    const timestamps = cooldowns.get(command.config.name);;
    const expirationTime = (command.config.cooldowns) * 1000;

    if (timestamps.has(senderID) && timeNow < timestamps.get(senderID) + expirationTime)
      return api.setMessageReaction('🕐', messageID, () => { }, true);


    try {
      //SET NEW COOLDOWN
      timestamps.set(senderID, timeNow);

      //EXECUTE COMMAND
      command.run({ api, event, args, models, Users, Threads, Currencies, permssion });

      if (DeveloperMode)
        logger.dev(`COMMAND > ${threadID} | ${senderID} | ${command.config.name} | ${args.join(" ")} | ${Date.now() - timeNow}ms`);
      return;
    } catch (error) {
      logger.error(`COMMAND > ${command.config.name}:`);
      console.log(error);
      return api.sendMessage('An error occurred while executing the command!', threadID, messageID);
    }
  };
};