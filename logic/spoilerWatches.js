const constants = require('./constants');
const logging = require('./common/logging');
const getAllCardsCommands = require('./commands/getAllCards');

module.exports = {
    //Start the interval to look for new cards for the given set and channelID
    startSpoilerWatch: function(channel, set) {
        setInterval(function(set) {
            logging.Log('Start looking for new cards in set ' + set + ' for channel ' + channel.id);
            getAllCardsCommands.getAllCards(channel, set);
        }, constants.SPOILERWATCHINTERVALTIME, set);
        return;
    },

    // Start the spoiler watch intervals for all combinations in the saved file
    startSpoilerWatches: function() {
        logging.Log('Watched sets: ' + JSON.stringify(watchedSetcodes));
        for (let i = 0; i < watchedSetcodes.length; i++) {
            let watchedSet = watchedSetcodes[i];
            logging.Log('Watched set: ' + JSON.stringify(watchedSet));
            logging.Log('Start looking for new cards in set ' + watchedSet.setCode + ' for channel ' + watchedSet.channelID);
            let channel = bot.channels.cache.get(watchedSet.channelID);
            module.exports.startSpoilerWatch(channel, watchedSet.setCode);
            getAllCardsCommands.getAllCards(channel, watchedSet.setCode);
        }
        return;
    }
}