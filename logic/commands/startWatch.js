const logging = require("../common/logging");
const dataIO = require("../data-io");
const spoilerWatches = require("../spoilerWatches");
const getNewCardsCommand = require("./getNewCards");

/* global watchedSetcodes, savedIntervals  */

module.exports = {
  startWatch: function (channel, set) {
    //Add the combination to the watched sets and save this
    watchedSetcodes.push({ setCode: set, channelID: channel.id });
    dataIO.saveWatchedSets();
    logging.Log("Starting spoilerwatch for set " + set + ".");
    channel.send("Starting spoilerwatch for set " + set + ".");

    //Immediately look for new cards
    logging.Log("Start looking for new cards on " + Date.now());
    getNewCardsCommand.getNewCards(channel, set);
    //Start the interval to look for new cards
    let interval = spoilerWatches.startSpoilerWatch(channel, set);
    savedIntervals.push({
      setcode: set,
      channel: channel.id,
      interval: interval,
    });
  },
};
