import fs from 'fs';

import constants from './constants.js';
import { Log, Error } from './common/logging.js';
import { startSpoilerWatches } from './spoilerWatches.js';

/* global watchedSetcodes:writable */

/**
 * Saves the array of watched sets and channel IDs to the data file
 */
export function saveWatchedSets() {
    fs.writeFile(
        constants.WATCHEDSETCODESPATH,
        JSON.stringify(watchedSetcodes),
        (err) => {
            if (err) {
                Log("Something went wrong with writing to watchedsetcodes.json");
                Error(err);
                return;
            }
            Log(`Successfully written to file ${constants.WATCHEDSETCODESPATH}.`);
        }
    );
}

/**
 * Reads the array of watched sets and channel IDs from the data file
 */
export function readWatchedSets() {
    if (!fs.existsSync(constants.DATADIRECTORY)) {
        fs.mkdirSync(constants.DATADIRECTORY);
    }
    if (!fs.existsSync(constants.WATCHEDSETCODESPATH)) {
        fs.writeFile(constants.WATCHEDSETCODESPATH, "[]", function (err) {
            if (err) {
                Log("Something went wrong with creating new empty watchedsetcodes.json");
                Error(err);
            }
        });
    }
    fs.readFile(constants.WATCHEDSETCODESPATH, function (err, buf) {
        if (err) {
            Log("Something went wrong with reading watchedsetcodes.json");
            Error(err);
        }
        watchedSetcodes = JSON.parse(buf);
        Log(`Successfully read file ${constants.WATCHEDSETCODESPATH}.`);
        startSpoilerWatches();
    });
    return;
}

/**
 * Reads preferred prefix from the settings
 * @param {*} defaultPrefix The default prefix to save if no settings file has been made yet
 */
export function readPrefix(defaultPrefix) {
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
                    Log("Something went wrong with creating new default settings file");
                    Error(err);
                }
            }
        );
    } else {
        fs.readFile(constants.SETTINGSPATH, function (err, buf) {
            if (err) {
                Log("Something went wrong with reading settings.json");
                Error(err);
            }
            let settings = JSON.parse(buf);
            Log(`Successfully read file ${constants.SETTINGSPATH}.`);
            newPrefix = settings.prefix;
        });
    }
    return newPrefix;
}

/**
 * Overwrites the current prefix in the settings data file with the given new prefix
 */
export function writePrefix(newPrefix) {
    if (!fs.existsSync(constants.DATADIRECTORY)) {
        fs.mkdirSync(constants.DATADIRECTORY);
    }
    if (!fs.existsSync(constants.SETTINGSPATH)) {
        fs.writeFile(
            constants.SETTINGSPATH,
            '{"prefix":"' + newPrefix + '"}',
            function (err) {
                if (err) {
                    Log("Something went wrong with creating new settings file");
                    Error(err);
                }
            }
        );
    } else {
        fs.readFile(constants.SETTINGSPATH, function (err, buf) {
            if (err) {
                Log("Something went wrong with reading settings.json");
                Error(err);
            }
            let settings = JSON.parse(buf);
            settings.prefix = newPrefix;
            fs.writeFile(
                constants.SETTINGSPATH,
                JSON.stringify(settings),
                function (err) {
                    if (err) {
                        Log("Something went wrong with updating prefix in the settings file");
                        Error(err);
                    }
                }
            );
            Log("Successfully updated the prefix in the settings file.");
        });
    }
}
