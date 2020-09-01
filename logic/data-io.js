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
          logging.Log("Something went wrong with writing to watchedsetcodes.json");
          logging.Error(err);
          return;
        }
        logging.Log(`Successfully written to file ${constants.WATCHEDSETCODESPATH}.`);
      }
    );
  },

  // Reads the array of watched sets and channel IDs from the data file
  readWatchedSets: function () {
    if (!fs.existsSync(constants.DATADIRECTORY)) {
      fs.mkdirSync(constants.DATADIRECTORY);
    }
    if (!fs.existsSync(constants.WATCHEDSETCODESPATH)) {
      fs.writeFile(constants.WATCHEDSETCODESPATH, "[]", function (err) {
        if (err) {
          logging.Log("Something went wrong with creating new empty watchedsetcodes.json");
          logging.Error(err);
        }
      });
    }
    fs.readFile(constants.WATCHEDSETCODESPATH, function (err, buf) {
      if (err) {
        logging.Log("Something went wrong with reading watchedsetcodes.json");
        logging.Error(err);
      }
      watchedSetcodes = JSON.parse(buf);
      logging.Log(`Successfully read file ${constants.WATCHEDSETCODESPATH}.`);
      spoilerWatches.startSpoilerWatches();
    });
    return;
  },

  // Reads preferred prefix from the settings
  readPrefix: function (defaultPrefix) {
    let newPrefix = defaultPrefix;
    if (!fs.existsSync(constants.DATADIRECTORY)) {
      fs.mkdirSync(constants.DATADIRECTORY);
    }
    if (!fs.existsSync(constants.SETTINGSPATH)) {
      fs.writeFile(
        constants.SETTINGSPATH,
        '{"prefix":"' + defaultPrefix + '"}',
        function (err) {
          if (err) {
            logging.Log("Something went wrong with creating new default settings file");
            logging.Error(err);
          }
        }
      );
    } else {
      fs.readFile(constants.SETTINGSPATH, function (err, buf) {
        if (err) {
          logging.Log("Something went wrong with reading settings.json");
          logging.Error(err);
        }
        let settings = JSON.parse(buf);
        logging.Log(`Successfully read file ${constants.SETTINGSPATH}.`);
        newPrefix = settings.prefix;
      });
    }
    return newPrefix;
  },

  // Write a new prefix to the settings
  writePrefix: function (newPrefix) {
    if (!fs.existsSync(constants.DATADIRECTORY)) {
      fs.mkdirSync(constants.DATADIRECTORY);
    }
    if (!fs.existsSync(constants.SETTINGSPATH)) {
      fs.writeFile(
        constants.SETTINGSPATH,
        '{"prefix":"' + newPrefix + '"}',
        function (err) {
          if (err) {
            logging.Log("Something went wrong with creating new settings file");
            logging.Error(err);
          }
        }
      );
    } else {
      fs.readFile(constants.SETTINGSPATH, function (err, buf) {
        if (err) {
          logging.Log("Something went wrong with reading settings.json");
          logging.Error(err);
        }
        let settings = JSON.parse(buf);
        settings.prefix = newPrefix;
        fs.writeFile(
          constants.SETTINGSPATH,
          JSON.stringify(settings),
          function (err) {
            if (err) {
              logging.Log("Something went wrong with updating prefix in the settings file");
              logging.Error(err);
            }
          }
        );
        logging.Log("Successfully updated the prefix in the settings file.");
      });
    }
  },
};
