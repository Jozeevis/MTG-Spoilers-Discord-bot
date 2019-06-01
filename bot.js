var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var fs = require("fs");
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
    var watchedSetcode = "";
});
bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
        let set = args[0];
        switch(cmd.toLowerCase()) {
            case 'getall':
                getAll(set, channelID, true);
            break;
            case 'watch':
            case 'startwatch':
                watchedSetcode = set;
                console.log(getDate() + 'Starting spoilerwatch for set ' + watchedSetcode + '.');
                bot.sendMessage({
                    to: channelID,
                    message: 'Starting spoilerwatch for set ' + watchedSetcode + '.',
                });

                console.log(getDate() + 'Start looking for new cards on ' + Date.now());
                getAll(set, channelID);
                var watchInterval = setInterval(function(set) {
                    console.log(getDate() + 'Start looking for new cards on ' + Date.now());
                    getAll(set, channelID);
                }, 1000 * 30 * 60, watchedSetcode);
            break;
            case 'unwatch':
            case 'stopwatch':
                console.log(getDate() + 'checking spoilerwatch for set ' + set + '.');
                if (watchedSetcode) {
                    console.log(getDate() + 'Stopping spoilerwatch for set ' + watchedSetcode + '.');
                    bot.sendMessage({
                        to: channelID,
                        message: 'Stopping spoilerwatch for set ' + watchedSetcode + '.',
                    });
                    clearInterval(watchInterval);
                    watchedSetcode = '';
                }
            break;
            case 'clear':
                let fileName = __dirname + '/data/' + set + '-data.json';
                try {
                    fs.exists(fileName, (exists) => {
                        fs.writeFile(fileName, "[]", (err) => {
                            if (err) console.log(getDate() + err);
                            console.log(getDate() + "Successfully cleared file " + fileName + ".");
                        });
                        bot.sendMessage({
                            to: channelID,
                            message: "Successfully cleared file for set with code " + set + ".",
                        });
                    });
                }
                catch(error) {
                    bot.sendMessage({
                        to: channelID,
                        message: "Something went wrong with clearing file for set with code " + set + ".",
                    });
                    console.log(getDate() + "Something went wrong with clearing file for set with code " + set + ".");
                    console.log(getDate() + error);
                }
            break;
         }
     }
});

function getAll(set, channelID, verbose = false) {
    let fileName = __dirname + '/data/' + set + '-data.json';
    let savedCardlist = JSON.parse("[]");
    fs.exists(fileName, (exists) => {
        if (!exists) {
            fs.writeFile(fileName, "[]", (err) => {
                if (err) console.log(getDate() + err);
                console.log(getDate() + "Successfully written to file " + fileName + ".");
            });
        }
        else {
            try {
                fs.readFile(fileName, function(err, buf) {
                    if (err) console.log(getDate() + err);
                    savedCardlist = JSON.parse(buf);
                    console.log(getDate() + "Successfully read file " + fileName + ".");
                });
            }
            catch(error) {
                console.log(getDate() + "Something went wrong with parsing data from existing saved file.");
                console.log(getDate() + error);
                return;
            }
        }

        if (verbose) {
            bot.sendMessage({
                to: channelID,
                message: 'Trying to get newly spoiled cards from set with code ' + set + '...',
            });
        }

        const https = require('https');
        https.get('https://api.scryfall.com/cards/search?order=spoiled&q=e%3A' + set + '&unique=prints', (resp) => {
        let data = '';

        // A chunk of data has been received.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            try {
                cardlist = JSON.parse(data);
            }
            catch(error) {
                console.log(getDate() + "Something went wrong with parsing data from Scryfall.");
                console.log(getDate() + error);
                return;
            }
            var newCardlist = [];
            if (cardlist.object == 'list' && cardlist.total_cards > 0) {
                cardlist.data.forEach(function(card) {
                    cardId = card.id;
                    cardName = card.name;

                    if (!savedCardlist.some(c => c.id == cardId)) {
                        newCardlist.push(card);
                        savedCardlist.push(card);
                    }
                });

                if (newCardlist.length <= 0) {
                    console.log(getDate() + 'No new cards were found with set code ' + set);
                    if (verbose) {
                        bot.sendMessage({
                            to: channelID,
                            message: 'No new cards were found with set code ' + set + '.',
                        });
                    }
                }
                else {
                    console.log(getDate() + newCardlist.length + ' new cards were found with set code ' + set);
                    var interval = setInterval(function(cards) {
                        if (cards.length <= 0) {
                            console.log(getDate() + 'Done with sending cards to channel.');
                            clearInterval(interval);
                        }
                        else {
                            let card = cards.pop();
                            cardName = card.name;
                            console.log(getDate() + 'Sending ' + cardName + ' to channel.');
                            cardImageUrl = card.image_uris.normal;
                            bot.sendMessage({
                                to: channelID,
                                message: cardName + '\n' + cardImageUrl,
                            });
                        }
                    }, 1000, newCardlist);

                    try {
                        let savedCardlistJSON = JSON.stringify(savedCardlist);
                        fs.writeFile(fileName, savedCardlistJSON, function(err) {
                            if (err) console.log(getDate() + err);
                            console.log(getDate() + 'New card list has succesfully been saved!');
                        });
                    }
                    catch(error) {
                        console.log(getDate() + "Something went wrong with saving new data.");
                        console.log(getDate() + error);
                        return;
                    }
                }
            }
            else {
                bot.sendMessage({
                    to: channelID,
                    message: 'Did not find any card with set code ' + set + '.',
                });
            }
        });

        }).on("error", (err) => {
            console.log(getDate() + "Error: " + err.message);
            bot.sendMessage({
                to: channelID,
                message: 'Error trying to get cards with set code ' + set + './n'  +
                'Check the console for more details.',
            });
        });
    });
}

function getDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var h = today.getHours();
    var m = today.getMinutes();

    var yyyy = today.getFullYear();
    if (dd < 10) {
    dd = '0' + dd;
    } 
    if (mm < 10) {
    mm = '0' + mm;
    } 
    if (h < 10) {
    h = '0' + h;
    } 
    if (m < 10) {
    m = '0' + m;
    } 
    var today = '[' + dd + '/' + mm + '/' + yyyy + ' ' + h + ':' + m + '] - ';
    return today;
}