//START

module.exports = ({ api, models, Users, Threads, Currencies, logger }) => {


  //Load environment
  logger.info(`${(!global.config.BOTNAME) ? "SenBot" : global.config.BOTNAME} > ${global.config.PREFIX}`);
  logger.info('BOTID > ' + global.data.botID);


  //REQUIRE ALL HANDLERS
  const handleCommand = require("./handler/handleCommand")({ api, models, Users, Threads, Currencies, logger });
  const handleCommandEvent = require("./handler/handleCommandEvent")({ api, models, Users, Threads, Currencies, logger });
  const handleReply = require("./handler/handleReply")({ api, models, Users, Threads, Currencies, logger });
  const handleReaction = require("./handler/handleReaction")({ api, models, Users, Threads, Currencies, logger });
  const handleEvent = require("./handler/handleEvent")({ api, models, Users, Threads, Currencies, logger });
  const handleCreateDatabase = require("./handler/handleCreateDatabase")({ models, Threads, Users, Currencies, logger });
  
  logger.loader(`==== ${Date.now() - global.client.timeStart}ms ====`);
  
  
  //START LISTENING
  return (error, event) => {
    if (error) return logger.error(error);

    //CHECK IF IS INBOX
    if (!global.config.allowInbox && !event.isGroup) return;

    switch (event.type) {
      case "message":
      case "message_reply":
      case "message_unsend":
        handleCreateDatabase({ event });
        handleCommand({ event });
        handleReply({ event });
        handleCommandEvent({ event });
        break;
      case "event":
      case "change_thread_image":
        handleEvent({ event });
        break;
      case "message_reaction":
        handleReaction({ event });
        break;
      default:
        break;
    }
    
    // LOG EVENTS
    if (global.config.DeveloperMode)
      if ([
        "message",
        "message_reply",
        "message_unsend",
        "event",
        "change_thread_image",
        "message_reaction"
      ].includes(event.type))
        console.log(event);
  };
};

//END