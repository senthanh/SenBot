//START

const senLogo = `            
▒█▀▀▀█ █▀▀ █▀▀▄ ▒█▀▀█ █▀▀█ █▀▀█ ░░▀ █▀▀ █▀▀ ▀▀█▀▀ 
░▀▀▀▄▄ █▀▀ █░░█ ▒█▄▄█ █▄▄▀ █░░█ ░░█ █▀▀ █░░ ░░█░░ 
▒█▄▄▄█ ▀▀▀ ▀░░▀ ▒█░░░ ▀░▀▀ ▀▀▀▀ █▄█ ▀▀▀ ▀▀▀ ░░▀░░
`

const { readdirSync, writeFileSync, createReadStream } = require('fs');
const { join } = require('path');
const { execSync } = require('child_process');
const { login, pauseLog } = require('@senpro/facebook-chat-api');
const { sequelize, Sequelize } = require("./app/includes/database");
const logger = require('./log.js');

global = new Object({
    nodemodule: new Object(),
    config: new Object(),
    configModule: new Object(),
    moduleData: new Object(),
    client: new Object({
        commands: new Map(),
        events: new Map(),
        cooldowns: new Map(),
        eventRegistered: new Array(),
        handleSchedule: new Array(),
        handleReaction: new Array(),
        handleReply: new Array(),
        configPath: __dirname + '/config.json',
        configModulePath: __dirname + '/configModule.json',
    }),
    data: new Object({
        botID: new String(),
        threadInfo: new Map(),
        threadData: new Map(),
        userName: new Map(),
        userBanned: new Array(),
        threadBanned: new Array(),
        threadAllowNSFW: new Array(),
        allUserID: new Array(),
        allCurrenciesID: new Array(),
        allThreadID: new Array()
    }),
    assets: new Object({
        images: new Object({}),
        anime: new Object(require(join(__dirname, 'app/includes/assets/json/sfw.json'))),
        hentai: new Object(require(join(__dirname, 'app/includes/assets/json/nsfw.json')))
    })
});

const assetsImagesPath = join(__dirname, 'app', 'includes', 'assets', 'images');
const assetsImagesFile = readdirSync(assetsImagesPath);

assetsImagesFile.forEach(file => {
    if (file.endsWith('.png')) {
        global.assets.images[file.split('.')[0]] = createReadStream(join(assetsImagesPath, file));
    }
})

//HANLDE UNHANDLED REJECTION ...
process
    .on('unhandledRejection', (reason) => {
        logger.error(reason);
        logger.error('Well, looks like there is an unhandled rejection, see above for more details.');
    })
    .on('uncaughtException', err => {
        logger.error(err);
        logger.error('Uncaught Exception thrown, see above for more details.');
    });



(async () => {

    //MAIN CONFIG LOAD
    var configValue, configModuleValue;
    try {
        configValue = require(global.client.configPath);
        logger.loader('Config found!');
    }
    catch {
        logger.error('config.json not found!');
        return;
    }

    try {
        for (const key in configValue) global.config[key] = configValue[key];
        logger.loader('Config Loaded!');
    }
    catch {
        logger.error('Can\'t load file config!');
        return;
    }

    //CONFIG MODULE LOAD
    try {
        configModuleValue = require(global.client.configModulePath);
        logger.loader('Config Module found!');
    }
    catch {
        logger.error('configModule.json not found!');
        return;
    }

    try {
        for (const key in configModuleValue) global.configModule[key] = configModuleValue[key];
        logger.loader('Config Module Loaded!');
    }
    catch {
        logger.error('Can\'t load file config!');
        return;
    }


    //SEQUELIZE AUTHENTICATION
    try {
        await sequelize.authenticate();
        const models = require('./app/includes/database/models')({ Sequelize, sequelize });
        logger.database('Database connected!');


        //CHECK FOR APPSTATE
        try {
            var appStateFile = join(__dirname, 'appstate.json');
            var appState = require(appStateFile);
            if (Array.isArray(appState)) {
                logger.loader('Appstate found!');
            }
            else throw 'APPSTATE NOT VALID!';
        }
        catch (e) {
            logger.error(e);
            return;
        }


        //LOGIN AND LOAD MODULES
            
        if (global.config.FCAOption.pauseLog) pauseLog();

        login({ appState }, async (error, api) => {
            if (error) return logger.error(error.error || error);
            api.setOptions(global.config.FCAOption);
            writeFileSync(appStateFile, JSON.stringify(api.getAppState(), null, "\t"));

            global.client.timeStart = Date.now();

            var commandFailed = 0,
                eventFailed = 0;

            const Commands = readdirSync(join(__dirname, 'app', 'modules', 'commands')).filter(command => command.endsWith('.js') && !command.includes('example') && !global.config.commandDisabled.includes(command));
            for (const command of Commands) {
                try {
                    var module = require(join(__dirname, 'app', 'modules', 'commands', command));
                    if (!module.config || !module.run || !module.config.group || !module.config.name) throw 'Invalid module';
                    if (global.client.commands.has(module.config.name || '')) throw 'Duplicate command name';
                    if (!module.config.version) module.config.version = '1.0.0';
                    if (!module.config.credits) module.config.credits = 'Annonymous';
                    if (!module.config.description) module.config.description = 'No description';
                    if (!module.config.usages) module.config.usages = '';
                    if (!module.config.hasPermssion) module.config.hasPermssion = 0;
                    if (!module.config.cooldowns) module.config.cooldowns = 3;
                    if (module.config.dependencies && typeof module.config.dependencies == 'object' && module.config.dependencies != null) {
                        if (Array.isArray(module.config.dependencies)) throw 'Invalid dependencies';
                        for (const dependency in module.config.dependencies) {
                            try {
                                if (!global.nodemodule.hasOwnProperty(dependency)) global.nodemodule[dependency] = require(dependency);
                            } catch {
                                logger.warn('Not found dependency ' + dependency + ' for command ' + module.config.name);
                                logger.warn('Installing dependency...');
                                execSync(`npm ---package-lock false --save install ${dependency}${(module.config.dependencies[dependency] == '*' || module.config.dependencies[dependency] == '' ? '' : '@' + module.config.dependencies[dependency])}`, { 'stdio': 'inherit', 'shell': true });

                                try {
                                    global.nodemodule[dependency] = require(dependency);
                                    logger.loader('All dependencies for command ' + module.config.name + ' installed!');
                                } catch (e) {
                                    throw 'Can\'t install dependency ' + dependency + '\n' + e;
                                }
                            }
                        }
                    }
                    if (module.config.additionalConfig)
                        try {
                            for (const additionalConfig in module.config.additionalConfig) {
                                if (typeof global.configModule[module.config.name] == 'undefined') global.configModule[module.config.name] = {};
                                if (typeof global.configModule[module.config.name][additionalConfig] == 'undefined') global.configModule[module.config.name][additionalConfig] = module.config.additionalConfig[additionalConfig];
                            }
                            logger.loader('Loaded additional config for command ' + module.config.name);
                        } catch (e) {
                            throw 'Can\'t add additional config for command ' + module.config.name + '\n' + e;
                        }
                    if (module.onLoad) {
                        try {
                            module.onLoad({ api, models });
                        } catch (e) {
                            throw 'Can\'t execute onLoad for module ' + module.config.name + '\n' + e;
                        };
                    }
                    if (module.handleEvent) global.client.eventRegistered.push(module.config.name);
                    module.config.group = module.config.group.toLowerCase();

                    global.client.commands.set(module.config.name, module);
                } catch (e) {
                    commandFailed++;
                    logger.error('Can\'t load command ' + command + ': ' + e);
                };
            }

            const events = readdirSync(join(__dirname, 'app', 'modules', 'events')).filter(event => event.endsWith('.js') && !global.config.eventDisabled.includes(event));
            for (const event of events) {
                try {
                    var module = require(join(__dirname, 'app', 'modules', 'events', event));
                    if (!module.config || !module.run) throw 'Invalid module';
                    if (global.client.events.has(module.config.name) || '') throw 'Duplicate event name';
                    if (module.config.dependencies && typeof module.config.dependencies == 'object' && module.config.dependencies != null) {
                        if (Array.isArray(module.config.dependencies)) throw 'Invalid dependencies';
                        for (const dependency in module.config.dependencies) {
                            try {
                                if (!global.nodemodule.hasOwnProperty(dependency)) global.nodemodule[dependency] = require(dependency);
                            } catch {
                                logger.warn('Not found dependency ' + dependency + ' for event ' + module.config.name);
                                logger.warn('Installing dependency...');
                                execSync(`npm --package-lock false --save install ${dependency}${(module.config.dependencies[dependency] == '*' || module.config.dependencies[dependency] == '' ? '' : '@' + module.config.dependencies[dependency])}`, { 'stdio': 'inherit', 'shell': true });

                                try {
                                    global.nodemodule[dependency] = require(dependency);
                                    logger.loader('All dependencies for event ' + module.config.name + ' installed!');
                                } catch (error) {
                                    throw 'Can\'t install dependency ' + dependency + '\n' + error;
                                }
                            }
                        }
                    }
                    if (module.config.additionalConfig) try {
                        for (const additionalConfig in module.config.additionalConfig) {
                            if (typeof global.configModule[module.config.name] == 'undefined') global.configModule[module.config.name] = {};
                            global.configModule[module.config.name][additionalConfig] = module.config.additionalConfig[additionalConfig];
                        }
                        logger.loader('Loaded additional config for event ' + module.config.name);
                    } catch (e) {
                        throw 'Can\'t add additional config for event ' + module.config.name + '\n' + e;
                    }
                    if (module.onLoad) try {
                        module.onLoad({ api, models });
                    } catch (e) {
                        throw 'Can\'t execute onLoad for event ' + module.config.name + '\n' + e;
                    }
                    global.client.events.set(module.config.name, module);
                } catch (error) {
                    eventFailed++;
                    logger.error('Can\'t load event ' + event + ': ' + error);
                }
            }


            logger.loader(`Loaded ${global.client.commands.size} commands and ${global.client.events.size} events.`);
            if (commandFailed > 0) logger.warn(`Failed to load ${commandFailed} commands.`);
            if (eventFailed > 0) logger.warn(`Failed to load ${eventFailed} events.`);
            writeFileSync(global.client.configModulePath, JSON.stringify(global.configModule, null, 4), 'utf8');


            //SETUP FEW THINGS
            const Users = require('./app/includes/controllers/users')({ models, api }),
                Threads = require('./app/includes/controllers/threads')({ models, api }),
                Currencies = require('./app/includes/controllers/currencies')({ models });


            //LOAD ENVIRONMENT
            await new Promise(async (resolve, reject) => {
                try {
                    logger.loader('Loading all variables from database...');
                    let threads = await Threads.getAll(),
                        users = await Users.getAll(),
                        currencies = await Currencies.getAll(['userID']);
                    //LOAD THREADS
                    for (const dataT of threads) {
                        const { data, threadInfo, threadID } = dataT;
                        const { banned, NSFW } = data || {};
                        const idThread = String(threadID);

                        //LOAD INFO
                        global.data.allThreadID.push(idThread);
                        global.data.threadData.set(idThread, data || {});
                        global.data.threadInfo.set(idThread, threadInfo || {});

                        //ADDITIONAL DATA
                        if (banned)
                            global.data.threadBanned.push(idThread);
                        if (NSFW)
                            global.data.threadAllowNSFW.push(idThread);
                    }

                    //Load users
                    for (const dataU of users) {
                        const { userID, name, data } = dataU;
                        const { banned } = data || {};
                        const idUsers = String(userID);

                        //LOAD INFO
                        global.data.allUserID.push(idUsers);
                        if (name && name.length != 0) global.data.userName.set(idUsers, name);

                        //ADDITIONAL DATA
                        if (banned) global.data.userBanned.push(idUsers);
                    }

                    //Load currencies
                    for (const dataC of currencies) global.data.allCurrenciesID.push(String(dataC.userID));

                    logger.loader('Loaded all variables from database!');
                    resolve();
                } catch (error) {
                    logger.loader('Error while loading variables from database!');
                    reject(error);
                }
            });
            global.data.botID = api.getCurrentUserID();

            //LOGO
            console.log(senLogo);

            //START LISTENING
            global.handleListen = api.listenMqtt(require('./app/includes/listen')({ api, models, Users, Threads, Currencies, logger }));
        });

    } catch (e) {
        logger.error('Can\'t connect to database!');
        logger.error(e);
    }
})();

//END
