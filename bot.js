import Discord from 'discord.js';

import auth from './logic/auth/auth.js';

import constants from './logic/constants.js';
import { readWatchedSets, readPrefix } from './logic/data-io.js';
import * as commands from './logic/commands.js';
import { Log } from './logic/common/logging.js';
import * as permissions from './logic/common/permissions.js';

// Initialize Discord Bot
Log("Initializing bot...");
global.bot = new Discord.Client(); /* global bot */

try {
    bot.login(auth.token);
} catch (err) {
    Log(err);
}

//When bot is ready
bot.on("ready", function () {
    Log("Connected!");
    Log(`Logged in as: ${bot.user.username} - (${bot.user.id})`);

    // Initialize savedIntervals and watchedSetcodes
    global.savedIntervals = [];
    global.watchedSetcodes = readWatchedSets();
    global.prefix = readPrefix(
        constants.BOTDEFAULTPREFIX
    ); /* global prefix */
});

//When bot reads message
bot.on("message", async (message) => {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with the specified prefix
    if (message.content.substring(0, prefix.length) == prefix) {
        try {
            let args = message.content.substring(prefix.length).split(" ");
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
                            commands.getCard(message.channel, query);
                        }
                        else {
                            message.channel.send(`You have to supply a query, like so:\n${prefix}get Sonic Assault`);
                        }
                    }
                    else {
                        message.channel.send(`You have to supply a query, like so:\n${prefix}get Sonic Assault`);
                    }
                    break;
                // Get all cards from the given set and send them in the current channel
                case "getall":
                case "getallcards":
                    if (permissions.checkPermissions(message)) {
                        commands.getAllCards(message.channel, arg2, arg3);
                    }
                    break;
                // Get all new cards from the given set and send them in the current channel
                case "getnew":
                case "getnewcards":
                    if (permissions.checkPermissions(message)) {
                        commands.getNewCards(message.channel, arg2, true, arg3);
                    }
                    break;
                // Start spoilerwatch for the given set ID in the current channel
                case "watch":
                case "startwatch":
                    if (permissions.checkPermissions(message)) {
                        commands.startWatch(message.channel, arg2);
                    }
                    break;
                // Stop spoilerwatch for the given set ID in the current channel
                case "unwatch":
                case "stopwatch":
                    if (permissions.checkPermissions(message)) {
                        commands.stopWatch(message.channel, arg2);
                    }
                    break;
                // Clears the saved data for the given set in the current channel
                case "clear":
                    if (permissions.checkPermissions(message)) {
                        commands.clear(message.channel, arg2);
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
                    commands.help(message.channel, prefix);
                    break;
                default:
                    message.channel.send(`No command ${cmd} found, please check your spelling or use ${prefix}help for a list of possible commands.`);
                    break;
            }
        } catch (error) {
            Error(`(UNCAUGHT) ${error}`);
            message.channel.send("Something went wrong.");
        }
    }
});

// Reconnect if the bot is disconnected gracefully
bot.on("disconnect", function (errMsg, code) {
    Error(`code ${code} : ${errMsg}`);
    if (code === 1000) {
        bot.connect();
    }
});
