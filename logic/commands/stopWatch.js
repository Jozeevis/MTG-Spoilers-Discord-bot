const logging = require("../common/logging");
const dataIO = require("../data-io");

/* global watchedSetcodes:writable, savedIntervals  */

module.exports = {
  stopWatch: function (channel, set) {
    logging.Log("checking spoilerwatch for set " + set + ".");
    logging.Log(
      "Checking if set matches with " +
        set +
        " and channel matches with " +
        channel.id
    );
    // Check if set is watched in the current channel
    if (
      watchedSetcodes &&
      watchedSetcodes.filter(function (watchedset) {
        watchedset.setCode == set && watchedset.channelID == channel.id;
      })
    ) {
      logging.Log("Stopping spoilerwatch for set " + set + ".");
      channel.send("Stopping spoilerwatch for set " + set + ".");
      // Find the timeout for this set and channel
      savedIntervals.find((o, i) => {
        if (o.setcode == set && o.channel == channel.id) {
          // Stop the interval that checks for spoilers
          clearInterval(o.interval);
          savedIntervals.splice(i, 1);
          return true;
        }
      });
      // Remove the set and channel combination from the watchedSetcodes and save it
      watchedSetcodes = watchedSetcodes.filter(function (watchedset) {
        watchedset.setCode != set || watchedset.channelID != channel.id;
      });
      dataIO.saveWatchedSets();
    } else {
      channel.send(
        "No spoilerwatch for set " + set + " is running in this channel."
      );
    }
  },
};
