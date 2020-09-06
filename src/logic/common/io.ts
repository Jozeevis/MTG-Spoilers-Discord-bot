import { Snowflake } from "discord.js";
import { Global } from '../../bot.js';
declare var global: Global;
import fs from 'fs';

import constants from './constants.js';
import { Log, Error } from './logging.js';
import { startSpoilerWatches } from './spoilerWatches.js';

/**
 * Returns the data filename for the given set and channelID
 */
export function getFilename(set: string, channelID: Snowflake) {
    return `./data/${channelID}-${set}-data.json`;
}

/**
 * Saves the array of watched sets and channel IDs to the data file
 */
export function saveWatchedSets() {
    fs.writeFile(
        constants.WATCHEDSETCODESPATH,
        JSON.stringify(global.watchedSetcodes),
        (err) => {
            if (err) {
                Log("Something went wrong with writing to watchedsetcodes.json");
                Error(err.message);
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
                Error(err.message);
            }
        });
    }
    fs.readFile(constants.WATCHEDSETCODESPATH, function (err, buf) {
        if (err) {
            Log("Something went wrong with reading watchedsetcodes.json");
            Error(err.message);
        }
        global.watchedSetcodes = JSON.parse(buf.toString());
        Log(`Successfully read file ${constants.WATCHEDSETCODESPATH}.`);
        startSpoilerWatches();
    });
    return;
}

/**
 * Reads preferred prefix from the settings
 * @param {*} defaultPrefix The default prefix to save if no settings file has been made yet
 */
export function readPrefix(defaultPrefix: string) {
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
                    Error(err.message);
                }
            }
        );
    } else {
        fs.readFile(constants.SETTINGSPATH, function (err, buf) {
            if (err) {
                Log("Something went wrong with reading settings.json");
                Error(err.message);
            }
            let settings = JSON.parse(buf.toString());
            Log(`Successfully read file ${constants.SETTINGSPATH}.`);
            newPrefix = settings.prefix;
        });
    }
    return newPrefix;
}

/**
 * Overwrites the current prefix in the settings data file with the given new prefix
 */
export function writePrefix(newPrefix: string) {
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
                    Error(err.message);
                }
            }
        );
    } else {
        fs.readFile(constants.SETTINGSPATH, function (err, buf) {
            if (err) {
                Log("Something went wrong with reading settings.json");
                Error(err.message);
            }
            let settings = JSON.parse(buf.toString());
            settings.prefix = newPrefix;
            fs.writeFile(
                constants.SETTINGSPATH,
                JSON.stringify(settings),
                function (err) {
                    if (err) {
                        Log("Something went wrong with updating prefix in the settings file");
                        Error(err.message);
                    }
                }
            );
            Log("Successfully updated the prefix in the settings file.");
        });
    }
}

/**
 * Reads saved card data for given setcode and channelID combination from file and returns the list of saved card ids
 */
export function getSavedCards(setcode: string, channelID: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        let savedCardlist = new Array<string>();
        let filename = getFilename(setcode, channelID);

        fs.exists(filename, (exists) => {
            if (!exists) {
                // If data file doesn't exist yet, make an empty one
                fs.writeFile(filename, "[]", (err) => {
                    if (err) {
                        Log(`Something went wrong while writing new data file ${filename}.`);
                        Error(err.message);
                        reject();
                    }
                    else {
                        Log(`Successfully written to file ${filename}.`);
                        resolve([]);
                    }
                });
            }
            else {
                // If data file does exist, try to read it
                try {
                    fs.readFile(filename, function (err, buf) {
                        if (err) {
                            Log(`Something went wrong while reading existing data file ${filename}.`);
                            Error(err.message);
                            reject();
                        }
                        else {
                            Log(`Successfully read file ${filename}.`);
                            savedCardlist = JSON.parse(buf.toString());
                            resolve(savedCardlist);
                        }
                    });
                } catch (error) {
                    Log(`Something went wrong while parsing data from existing data file ${filename}.`);
                    Error(error);
                    reject();
                }
            }
        });
    });
}

/**
 * Saves saved card data for given setcode and channelID combination to file, overwriting current file
 */
export function setSavedCards(setcode: string, channelID: string, newSavedCardIDs: string[]) {
    let filename = getFilename(setcode, channelID);

    let savedCardListJSON = JSON.stringify(newSavedCardIDs);
    fs.writeFile(filename, savedCardListJSON, function (err) {
        if (err) {
            Log(`Something went wrong while writing to file ${filename}.`);
            Error(err.message);
        }
        else {
            Log(`Succesfully written to file ${filename}.`);
        }
    });
}