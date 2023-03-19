import Discord from 'discord.js';

import auth from './auth';

import constants from './logic/constants';
import { readWatchedSets, readPrefix } from './logic/common/io';
import * as commands from './logic/commands';
import { Log, Error } from './logic/common/logging';
import * as permissions from './logic/common/permissions';
import { IWatchedSetcode, ISavedInterval } from './models';

export interface Global extends NodeJS.Global {
    bot: Discord.Client,
    savedIntervals: ISavedInterval[],
    watchedSetcodes: IWatchedSetcode[],
    prefix: string,
}
declare var global: Global;

// Initialize Discord Bot
Log("Initializing bot...");
global.bot = new Discord.Client({ intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
] });

try {
    global.bot.login(auth.token);
} catch (error) {
    Error(error);
}

//When bot is ready
global.bot.on(Discord.Events.ClientReady, function () {
    Log("Connected!");
    Log(`Logged in as: ${global.bot.user?.username} - (${global.bot.user?.id})`);

    // Initialize savedIntervals and watchedSetcodes
    global.savedIntervals = [];
    global.prefix = readPrefix(
        constants.BOTDEFAULTPREFIX
    );
    readWatchedSets();
});

// When the bot sees a message in any channel it can read
global.bot.on(Discord.Events.MessageCreate, async (message) => {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with the specified prefix
    if (message.content.substring(0, global.prefix.length) == global.prefix) {
        try {
            let args = message.content.substring(global.prefix.length).split(" ");
            let cmd = args[0];

            args = args.splice(1);
            let arg2 = args[0];

            let arg3;
            if (args.length > 1) {
                arg3 = args[1];
            }

            switch (cmd.toLowerCase()) {
                // Response test
                case "ping":
                    message.channel.send('Pong!');
                    break;
                // Tries to find a card with name like the given name and send it in the current channel
                case "get":
                    var queryIndex = message.content.indexOf(" ") + 1;
                    if (queryIndex > 0) {
                        var query = message.content.substring(queryIndex);
                        if (query) {
                            commands.getCardCommand(message.channel, query);
                        }
                        else {
                            message.channel.send(`You have to supply a query, like so:\n${global.prefix}get Sonic Assault`);
                        }
                    }
                    else {
                        message.channel.send(`You have to supply a query, like so:\n${global.prefix}get Sonic Assault`);
                    }
                    break;
                // Get all cards from the given set and send them in the current channel
                case "getall":
                case "getallcards":
                    if (permissions.checkPermissions(message)) {
                        let bool = arg3 === "true";
                        commands.getAllCardsCommand(message.channel, arg2, bool);
                    }
                    break;
                // Get all new cards from the given set and send them in the current channel
                case "getnew":
                case "getnewcards":
                    if (permissions.checkPermissions(message)) {
                        let bool = arg3 === "true";
                        commands.getNewCardsCommand(message.channel, arg2, true, bool);
                    }
                    break;
                // Start spoilerwatch for the given set ID in the current channel
                case "watch":
                case "startwatch":
                    if (permissions.checkPermissions(message)) {
                        commands.startWatchCommand(message.channel, arg2);
                    }
                    break;
                // Stop spoilerwatch for the given set ID in the current channel
                case "unwatch":
                case "stopwatch":
                    if (permissions.checkPermissions(message)) {
                        commands.stopWatchCommand(message.channel, arg2);
                    }
                    break;
                // Clears the saved data for the given set in the current channel
                case "clear":
                    if (permissions.checkPermissions(message)) {
                        commands.clearCommand(message.channel, arg2);
                    }
                    break;
                // Changes the prefix the bot uses for its commands
                case "prefix":
                    if (permissions.checkPermissions(message)) {
                        commands.prefixCommand(message.channel, arg2);
                    }
                    break;
                // Sends a list of all possible commands
                case "help":
                    commands.helpCommand(message.channel, global.prefix);
                    break;
                default:
                    message.channel.send(`No command ${cmd} found, please check your spelling or use ${global.prefix}help for a list of possible commands.`);
                    break;
            }
        } catch (error) {
            Error(`(UNCAUGHT) ${error}`);
            message.channel.send("Something went wrong.");
        }
    }
});

// Reconnect if the bot is disconnected gracefully
global.bot.on("disconnect", function (errMsg, code) {
    Error(`code ${code} : ${errMsg}`);
    if (code === 1000) {
        try {
            global.bot.login(auth.token);
        } catch (error) {
            Error(error);
        }
    }
});
