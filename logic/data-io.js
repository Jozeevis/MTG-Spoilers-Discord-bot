const fs = require("fs");

const constants = require("./constants");
const logging = require("./common/logging");
const spoilerWatches = require("./spoilerWatches");

/* global watchedSetcodes:writable */

module.exports = {
  // Saves the array of watched sets and channel IDs to the data file
  saveWatchedSets: function () {
    fs.writeFile(
      constants.WATCHEDSETCODESPATH,
      JSON.stringify(watchedSetcodes),
      (err) => {
        if (err) {
          logging.Log(
            "Something went wrong with writing to watchedsetcodes.json"
          );
          logging.Log("ERROR: " + err);
          return;
        }
        logging.Log(
          "Successfully written to file " + constants.WATCHEDSETCODESPATH + "."
        );
      }
    );
  },

  // Reads the array of watched sets and channel IDs from the data file
  readWatchedSets: function () {
    if (!fs.existsSync(constants.WATCHEDSETCODESDIRECTORY)) {
      fs.mkdirSync(constants.WATCHEDSETCODESDIRECTORY);
    }
    if (!fs.existsSync(constants.WATCHEDSETCODESPATH)) {
      fs.writeFile(constants.WATCHEDSETCODESPATH, "[]", function (err) {
        if (err) {
          logging.Log(
            "Something went wrong with creating new empty watchedsetcodes.json"
          );
          logging.Log("ERROR: " + err);
        }
      });
    }
    fs.readFile(constants.WATCHEDSETCODESPATH, function (err, buf) {
      if (err) {
        logging.Log("Something went wrong with reading watchedsetcodes.json");
        logging.Log("ERROR: " + err);
      }
      watchedSetcodes = JSON.parse(buf);
      logging.Log(
        "Successfully read file " + constants.WATCHEDSETCODESPATH + "."
      );
      spoilerWatches.startSpoilerWatches();
    });
    return;
  },
};
