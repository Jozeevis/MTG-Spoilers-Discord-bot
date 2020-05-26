var Discord = require('discord.io');
var auth = require('./auth.json');
var fs = require("fs");

//Constants
WATCHEDSETCODESDIRECTORY = __dirname + '/data';
WATCHEDSETCODESFILENAME = 'watchedsetcodes.json';
WATCHEDSETCODESPATH = WATCHEDSETCODESDIRECTORY + '/' + WATCHEDSETCODESFILENAME;
SPOILERWATCHINTERVALTIME = 1000 * 30 * 60;

// Initialize Discord Bot
Log('Initializing bot...');
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});

//When bot is ready
bot.on('ready', function (evt) {
    Log('Connected!');
    Log('Logged in as: ' + bot.username + ' - (' + bot.id + ')');

    // Read watched sets and start spoiler watches
    watchedSetcodes = readWatchedSets();
    intervals = [];
});

//When bot reads message
bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        try {
            var args = message.substring(1).split(' ');
            var cmd = args[0];
        
            args = args.splice(1);
            let set = args[0];
            switch(cmd.toLowerCase()) {
                //Get all cards from the given set and send them in the current channel
                case 'getallCards':
                case 'getallcards':
                case 'getall':
                    getAllCards(set, channelID, true);
                break;
                //Start spoilerwatch for the given set ID in the current channel
                case 'watch':
                case 'startwatch':
                    //Add the combination to the watched sets and save this
                    watchedSetcodes.push({"setCode":set, "channelID":channelID});
                    saveWatchedSets()
                    Log('Starting spoilerwatch for set ' + set + '.');
                    bot.sendMessage({
                        to: channelID,
                        message: 'Starting spoilerwatch for set ' + set + '.',
                    });

                    //Immediately look for new cards
                    Log('Start looking for new cards on ' + Date.now());
                    getAllCards(set, channelID);
                    //Start the interval to look for new cards
                    startSpoilerWatch(set, channelID);
                break;
                //Stop spoilerwatch for the given set ID in the current channel
                case 'unwatch':
                case 'stopwatch':
                    Log('checking spoilerwatch for set ' + set + '.');
                    Log('Checking if set matches with ' + set + ' and channel matches with ' + channelID);
                    // Check if set is watched in the current channel
                    if (watchedSetcodes && watchedSetcodes.filter(function (watchedset) {
                        watchedset.setCode == set && watchedset.channelID == channelID
                    })) 
                    {
                        Log('Stopping spoilerwatch for set ' + set + '.');
                        bot.sendMessage({
                            to: channelID,
                            message: 'Stopping spoilerwatch for set ' + set + '.',
                        });
                        // Find the timeout for this set and channel
                        intervals.find((o, i) => {
                            if (o.setcode == set && o.channel == channelID) {
                                // Stop the interval that checks for spoilers
                                clearInterval(o.interval);
                                intervals.splice(i, 1);
                                return true;
                            }
                        });
                        // Remove the set and channel combination from the watchedSetcodes and save it
                        watchedSetcodes = watchedSetcodes.filter(function(watchedset) {
                            watchedset.setCode != set || watchedset.channelID != channelID
                        });
                        saveWatchedSets()
                    }
                break;
                // Clears the saved data for the given set in the current channel
                case 'clear':
                    let fileName = getFilename(set, channelID);
                    try {
                        fs.writeFile(fileName, "[]", (err) => {
                            if (err) Log('ERROR: ' + err);
                            Log("Successfully cleared file " + fileName + ".");
                        });
                        bot.sendMessage({
                            to: channelID,
                            message: "Successfully cleared file for set with code " + set + ".",
                        });
                    }
                    catch(error) {
                        bot.sendMessage({
                            to: channelID,
                            message: "Something went wrong with clearing file for set with code " + set + ".",
                        });
                        Log("Something went wrong with clearing file for set with code " + set + ".");
                        Log('ERROR: ' + error);
                    }
                break;
            }
        }
        catch (error) {
            Log('UNCAUGHT ERROR: ' + error)
            bot.sendMessage({
                to: channelID,
                message: "Something went really wrong. Please tell Lars he's an idiot.",
            });
        }
     }
});

// Finds all new cards in the given set that haven't been posted to the given channel yet and posts them there
function getAllCards(set, channelID, verbose = false) {
    // Read which cards are already saved
    let fileName = getFilename(set, channelID);
    let savedCardlist = JSON.parse("[]");
    fs.exists(fileName, (exists) => {
        if (!exists) {
            // If data file doesn't exist yet, make an empty one
            fs.writeFile(fileName, "[]", (err) => {
                if (err) Log('ERROR: ' + err);
                Log("Successfully written to file " + fileName + ".");
            });
        }
        else {
            // If data file does exist, try to read it
            try {
                fs.readFile(fileName, function(err, buf) {
                    if (err) Log("ERROR: " + err);
                    savedCardlist = JSON.parse(buf);
                    Log("Successfully read file " + fileName + ".");
                });
            }
            catch(error) {
                Log("Something went wrong with parsing data from existing saved file.");
                Log('ERROR: ' + error);
                return;
            }
        }

        if (verbose) {
            bot.sendMessage({
                to: channelID,
                message: 'Trying to get newly spoiled cards from set with code ' + set + '...',
            });
        }

        // Make a request to the Scryfall api
        const https = require('https');
        https.get('https://api.scryfall.com/cards/search?order=spoiled&q=e%3A' + set + '&unique=prints', (resp) => {
        let data = '';

        // A chunk of data has been received.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received.
        resp.on('end', () => {
            try {
                // Parse the data in the response
                cardlist = JSON.parse(data);
            }
            catch(error) {
                Log("Something went wrong with parsing data from Scryfall.");
                Log('ERROR:' + error);
                return;
            }
            var newCardlist = [];
            if (cardlist.object == 'list' && cardlist.total_cards > 0) {
                // For every card: check if it's already save, otherwise at it to the new list
                cardlist.data.forEach(function(card) {
                    cardId = card.oracle_id;

                    if (!savedCardlist.some(c => c == cardId)) {
                        newCardlist.push(card);
                        savedCardlist.push(cardId);
                    }
                });

                // If new list is empty, no new cards were found
                if (newCardlist.length <= 0) {
                    Log('No new cards were found with set code ' + set);
                    if (verbose) {
                        bot.sendMessage({
                            to: channelID,
                            message: 'No new cards were found with set code ' + set + '.',
                        });
                    }
                }
                else {
                    // If new list wasn't empty, send one of the new cards to the channel every second
                    Log(newCardlist.length + ' new cards were found with set code ' + set);
                    var interval = setInterval(function(cards) {
                        if (cards.length <= 0) {
                            Log('Done with sending cards to channel.');
                            clearInterval(interval);
                        }
                        else {
                            // Get all relevant data from the card
                            let card = cards.pop();
                            cardName = card.name;
                            Log('Sending ' + cardName + ' to channel.');
                            cardImageUrl = card.image_uris.normal;
                            cardText = card.oracle_text;
                            cardCost = card.mana_cost.replace(new RegExp('[{}]','g'), '');
                            cardType = card.type_line;
                            cardRarity = card.rarity;
                            cardFlavourText = card.flavor_text;

                            // Construct the discord message
                            var message = '**' + cardName + '** - ' + cardCost + '\n' 
                            + cardType + ' (' + cardRarity + ')\n' 
                            + cardText + '\n';
                            if (cardFlavourText != undefined) {
                                message = message + '_' + cardFlavourText + '_\n';
                            }
                            message = message + cardImageUrl;

                            intervals.push({interval: interval, setcode: set, channel: channelID});

                            bot.sendMessage({
                                to: channelID,
                                message: message,
                            });
                        }
                    }, 1000, newCardlist);

                    try {
                        // Save the updated list of saved cards to the datafile
                        let savedCardlistJSON = JSON.stringify(savedCardlist);
                        fs.writeFile(fileName, savedCardlistJSON, function(err) {
                            if (err) Log("ERROR: " + err);
                            Log('New card list has succesfully been saved!');
                        });
                    }
                    catch(error) {
                        Log("Something went wrong with saving new data.");
                        Log("ERROR: " + error);
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
            Log("Error: " + err.message);
            bot.sendMessage({
                to: channelID,
                message: 'Error trying to get cards with set code ' + set + './n'  +
                'Check the console for more details.',
            });
        });
    });
}

// Returns the data filename for the given set and channelID
function getFilename(set, channelID) {
    return __dirname + '/data/' + channelID + '-' + set + '-data.json';
}

// Saves the array of watched sets and channel IDs to the data file
function saveWatchedSets() {
    fs.writeFile(WATCHEDSETCODESPATH, JSON.stringify(watchedSetcodes), (err) => {
        if (err) Log('ERROR: ' + err);
        Log("Successfully written to file " + WATCHEDSETCODESPATH + ".");
    });
}

// Reads the array of watched sets and channel IDs from the data file
function readWatchedSets() {
    if (!fs.existsSync(WATCHEDSETCODESDIRECTORY)) {
        fs.mkdirSync(WATCHEDSETCODESDIRECTORY);
    }
    if (!fs.existsSync(WATCHEDSETCODESPATH)) {
        fs.writeFile(WATCHEDSETCODESPATH, '[]', function (err) {
            if (err) {
                Log('ERROR: ' + err);
            }
        });
    }
    fs.readFile(WATCHEDSETCODESPATH, function(err, buf) {
        if (err) Log('ERROR: ' + err);
        watchedSetcodes = JSON.parse(buf);
        Log("Successfully read file " + WATCHEDSETCODESPATH + ".");
        startSpoilerWatches()
    });
    return;
}

// Start the spoiler watch intervals for all combinations in the saved file
function startSpoilerWatches() {
    Log('Watched sets: ' + JSON.stringify(watchedSetcodes));
    for (var i = 0; i < watchedSetcodes.length; i++) {
        var watchedSet = watchedSetcodes[i];
        Log('Watched set: ' + JSON.stringify(watchedSet));
        Log('Start looking for new cards in set ' + watchedSet.setCode + ' for channel ' + watchedSet.channelID);
        startSpoilerWatch(watchedSet.setCode, watchedSet.channelID);
        getAllCards(watchedSet.setCode, watchedSet.channelID, false);
    }
    return;
}

//Start the interval to look for new cards for the given set and channelID
function startSpoilerWatch(set, channelID) {
    setInterval(function(set) {
        Log('Start looking for new cards in set ' + set + ' for channel ' + channelID);
        getAllCards(set, channelID);
    }, SPOILERWATCHINTERVALTIME, set);
    return;
}

// Returns the current date in a readable format
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

function Log(message) {
    console.log(getDate() + " - " + message);
}