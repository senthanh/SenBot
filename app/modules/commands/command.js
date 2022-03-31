module.exports.config = {
    name: "command",
    version: "1.0.0",
    hasPermssion: 2,
    credits: "SenProject",
    description: "load/unload command",
    group: "group",
    usages: "[option] [text]",
    cooldowns: 3,
    dependencies: {
        "fs": " ",
        "child_process": " ",
    }
};

const { execSync } = require('child_process');
const logger = require("../../../log");

module.exports.run = async function ({ api, event, args, models }) {
    const { messageID, threadID } = event;
    const { readdirSync } = require("fs");

    const allCommand = readdirSync(__dirname).filter(file => file.endsWith(".js") && file !== "example.js");
    if (args[0] == "loadAll") {
        global.client.commands = new Map();

        let commandFailed = 0;
        await new Promise(async (resolve, reject) => {
            try {
                for (const command of allCommand) {
                    await loadCommand(command, api, models);
                }
                resolve();
            } catch (e) {
                commandFailed++;
                reject();
            }
        });
        logger.loader(`Loaded ${allCommand.length - commandFailed} command(s)`);
        if (commandFailed > 0) {
            logger.error(`Can't load ${commandFailed} command(s)`);
        }

        return api.sendMessage(`Loaded ${allCommand.length - commandFailed} command(s)` + (commandFailed > 0 ? `\nCan't load ${commandFailed} command(s)\nCheck console for more info` : ""), threadID);
    } else if (args[0] == "load") {
        if (!args[1]) return api.sendMessage("Please specify a command file name", threadID);
        
        const command = args[1] + '.js';
        if (!allCommand.includes(command)) return api.sendMessage("Command file not found", threadID);
        const getCommandName = require(`./${command}`).config.name || undefined;
        if (getCommandName != undefined && global.client.commands.has(getCommandName)) await unloadCommand(getCommandName);
        try {
            const commandName = await loadCommand(command, api, models);
            logger.loader(`Loaded command ${commandName}`);
            return api.sendMessage(`Loaded command ${commandName}`, threadID);
        } catch (e) {
            return api.sendMessage(`Can't load command file: ${command}`, threadID);
        }
    } else if (args[0] == "unload") {
        if (!args[1]) return api.sendMessage("Please specify a command name", threadID);
        
        const command = args[1];
        if (!global.client.commands.has(command)) return api.sendMessage(`Can't unload command: ${command}\nCommand not found.`, threadID);
        try {
            await unloadCommand(command);
            logger.warn(`Unloaded command ${command}`);
            return api.sendMessage(`Unloaded command ${command}`, threadID);
        } catch (e) {
            return api.sendMessage(`Can't unload command: ${command}`, threadID);
        }
    }
}


const loadCommand = async (command, api, models) => new Promise((resolve, reject) => {
    try {
        var module = require(`./${command}`);
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
                    execSync(`cd ../../.. && npm ---package-lock false --save install ${dependency}${(module.config.dependencies[dependency] == '*' || module.config.dependencies[dependency] == '' ? '' : '@' + module.config.dependencies[dependency])}`, { 'stdio': 'inherit', 'shell': true });

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
        resolve(module.config.name);
    } catch (e) {
        logger.error('Can\'t load command ' + command + ': ' + e);
        reject(e);
    };
});

const unloadCommand = async command => new Promise((resolve, reject) => {
    try {
        global.client.commands.delete(command);
        resolve();
    } catch (e) {
        logger.error('Can\'t unload command ' + command + ': ' + e);
        reject(e);
    };
});
