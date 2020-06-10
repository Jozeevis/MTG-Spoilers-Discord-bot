const logging = require('../common/logging');
const dataIO = require('../data-io');
const spoilerWatches = require('../spoilerWatches');
const getAllCardsCommand = require('./getAllCards');

module.exports = {
    startWatch: function(channel, set) {
        //Add the combination to the watched sets and save this
        console.log('Watched setcodes ext: ' + watchedSetcodes)
        watchedSetcodes.push({"setCode":set, "channelID":channel.id});
        dataIO.saveWatchedSets()
        logging.Log('Starting spoilerwatch for set ' + set + '.');
        channel.send('Starting spoilerwatch for set ' + set + '.');

        //Immediately look for new cards
        logging.Log('Start looking for new cards on ' + Date.now());
        getAllCardsCommand.getAllCards(channel, set);
        //Start the interval to look for new cards
        spoilerWatches.startSpoilerWatch(set, channel.id);
    }
}