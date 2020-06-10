const Discord = require('discord.js');
const auth = require('./auth.json');

const dataIO = require('./logic/data-io');
const commands = require('./logic/commands');
const logging = require('./logic/common/logging');
const permissions = require('./logic/common/permissions');

// Initialize Discord Bot
logging.Log('Initializing bot...');
global.bot = new Discord.Client();

try {
    bot.login(auth.token);
} catch(err) {
    logging.Log(err);
}

//When bot is ready
bot.on('ready', function (evt) {
    logging.Log('Connected!');
    logging.Log('Logged in as: ' + bot.user.username + ' - (' + bot.user.id + ')');

    // Initialize savedIntervals and watchedSetcodes
    global.savedIntervals = [];
    global.watchedSetcodes = dataIO.readWatchedSets();
});

//When bot reads message
bot.on('message', async message => {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.content.substring(0, 1) == '!') {
        try {
            let args = message.content.substring(1).split(' ');
            let cmd = args[0];
        
            args = args.splice(1);
            let set = args[0];
            switch(cmd.toLowerCase()) {
                //Get all cards from the given set and send them in the current channel
                case 'getall':
                case 'getallcards':
                    if (permissions.checkPermissions(message)) {
                        commands.getAllCards(message.channel, set, true);
                    }
                break;
                //Start spoilerwatch for the given set ID in the current channel
                case 'watch':
                case 'startwatch':
                    if (permissions.checkPermissions(message)) {
                        commands.startWatch(message.channel, set);
                    }
                break;
                //Stop spoilerwatch for the given set ID in the current channel
                case 'unwatch':
                case 'stopwatch':
                    if (permissions.checkPermissions(message)) {
                        commands.stopWatch(message.channel, set);
                    }
                break;
                // Clears the saved data for the given set in the current channel
                case 'clear':
                    if (permissions.checkPermissions(message)) {
                        commands.clear(message.channel, set);
                    }
                break;
            }
        }
        catch (error) {
            logging.Log('UNCAUGHT ERROR: ' + error)
            message.channel.send("Something went wrong.");
        }
     }
});

// Reconnect if the bot is disconnected gracefully
bot.on('disconnect', function(errMsg, code) { 
    logging.Log('ERROR code ' + code +': ' + errMsg);
    if (code === 1000) {
        bot.connect();
    }
});