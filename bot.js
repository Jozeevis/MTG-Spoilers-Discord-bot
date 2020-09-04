const Discord = require("discord.js");
const auth = require("./auth.json");

const constants = require("./logic/constants");
const dataIO = require("./logic/data-io");
const commands = require("./logic/commands");
const logging = require("./logic/common/logging");
const permissions = require("./logic/common/permissions");

// Initialize Discord Bot
logging.Log("Initializing bot...");
global.bot = new Discord.Client(); /* global bot */

try {
  bot.login(auth.token);
} catch (err) {
  logging.Log(err);
}

//When bot is ready
bot.on("ready", function () {
  logging.Log("Connected!");
  logging.Log(`Logged in as: ${bot.user.username} - (${bot.user.id})`);

  // Initialize savedIntervals and watchedSetcodes
  global.savedIntervals = [];
  global.watchedSetcodes = dataIO.readWatchedSets();
  global.prefix = dataIO.readPrefix(
    constants.BOTDEFAULTPREFIX
  ); /* global prefix */
});

//When bot reads message
bot.on("message", async (message) => {
  // Our bot needs to know if it will execute a command
  // It will listen for messages that will start with the specified prefix
  if (message.content.substring(0, 1) == prefix) {
    try {
      let args = message.content.substring(1).split(" ");
      let cmd = args[0];

      args = args.splice(1);
      let arg2 = args[0];

      let arg3;
      if (args.length > 1) {
          arg3 = args[1];
      }

      switch (cmd.toLowerCase()) {
        //Response test
        case "ping":
            message.channel.send('Pong!');
            break;
        //Tries to find a card with name like the given name and send it in the current channel
        case "get":
            var queryIndex = message.content.indexOf(" ") + 1;
            if (queryIndex > 0) {
                var query = message.content.substring(queryIndex);
                if (query) {
                    commands.getCard(message.channel, query);
                }
                else {
                    message.channel.send('You have to supply a query, like so:\n!get Sonic Assault');
                }
            }
            else {
                message.channel.send('You have to supply a query, like so:\n!get Sonic Assault');
            }
            break;
        //Get all cards from the given set and send them in the current channel
        case "getall":
        case "getallcards":
          if (permissions.checkPermissions(message)) {
            commands.getAllCards(message.channel, arg2, arg3);
          }
          break;
        //Get all new cards from the given set and send them in the current channel
        case "getnew":
        case "getnewcards":
          if (permissions.checkPermissions(message)) {
            commands.getNewCards(message.channel, arg2, true, arg3);
          }
          break;
        //Start spoilerwatch for the given set ID in the current channel
        case "watch":
        case "startwatch":
          if (permissions.checkPermissions(message)) {
            commands.startWatch(message.channel, arg2);
          }
          break;
        //Stop spoilerwatch for the given set ID in the current channel
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
            commands.prefix(message.channel, arg2);
          }
          break;
      }
    } catch (error) {
      logging.Error(`(UNCAUGHT) ${error}`);
      message.channel.send("Something went wrong.");
    }
  }
});

// Reconnect if the bot is disconnected gracefully
bot.on("disconnect", function (errMsg, code) {
  logging.Error(`code ${code} : ${errMsg}`);
  if (code === 1000) {
    bot.connect();
  }
});
