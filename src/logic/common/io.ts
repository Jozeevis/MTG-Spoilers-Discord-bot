import { Snowflake } from "discord.js";
import fs from 'fs';

import constants from '../constants';
import { Log, Error } from './logging';
import { startSpoilerWatches } from './spoilerWatches';
import { BotSettings } from "../../models/bot-settings";

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
 * Reads global setting values from the settings file
 */
export function readSettings() {
    let settings = new BotSettings(constants.BOTDEFAULTPREFIX, constants.BOTDEFAULTSHOWREPRINTS);
    if (!fs.existsSync(constants.DATADIRECTORY)) {
        fs.mkdirSync(constants.DATADIRECTORY);
    }
    if (!fs.existsSync(constants.SETTINGSPATH)) {
        writeNewSettingsFile();
    } else {
        try {
            let buf = fs.readFileSync(constants.SETTINGSPATH);
            settings = JSON.parse(buf.toString());
            // Because showReprints is a new setting, set it to default if it doesn't exist yet
            if (settings.showReprints === undefined) {
                writeShowReprints(constants.BOTDEFAULTSHOWREPRINTS);
                settings.showReprints = constants.BOTDEFAULTSHOWREPRINTS;
            }
            Log(`Successfully read file ${constants.SETTINGSPATH}.`);
        }
        catch (err) {
            Log("Something went wrong with reading settings.json");
            Error(err);
        }
    }
    return settings;
}

/**
 * Overwrites the current prefix in the settings data file with the given new prefix
 */
export function writePrefix(newPrefix: string) {
    if (!fs.existsSync(constants.DATADIRECTORY)) {
        fs.mkdirSync(constants.DATADIRECTORY);
    }
    if (!fs.existsSync(constants.SETTINGSPATH)) {
        writeNewSettingsFile(newPrefix, undefined);
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
 * Overwrites the current show reprints value in the settings data file with the given value
 */
export function writeShowReprints(newValue: boolean) {
    if (!fs.existsSync(constants.DATADIRECTORY)) {
        fs.mkdirSync(constants.DATADIRECTORY);
    }
    if (!fs.existsSync(constants.SETTINGSPATH)) {
        writeNewSettingsFile(undefined, newValue);
    } else {
        fs.readFile(constants.SETTINGSPATH, function (err, buf) {
            if (err) {
                Log("Something went wrong with reading settings.json");
                Error(err.message);
            }
            let settings = JSON.parse(buf.toString());
            settings.showReprints = newValue;
            fs.writeFile(
                constants.SETTINGSPATH,
                JSON.stringify(settings),
                function (err) {
                    if (err) {
                        Log("Something went wrong with updating reprints value in the settings file");
                        Error(err.message);
                    }
                }
            );
            Log("Successfully updated the reprints value in the settings file.");
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

/**
 * Creates a new settings file with the given values or default values if undefined
 * @param prefixValue Prefix value to be saved, default if undefined
 * @param showReprintsValue Reprints value to be saved, default if undefined
 */
function writeNewSettingsFile(prefixValue?: string, showReprintsValue?: boolean) {
    let defaultSettings = new BotSettings(prefixValue ?? constants.BOTDEFAULTPREFIX, showReprintsValue ?? constants.BOTDEFAULTSHOWREPRINTS);
    fs.writeFile(
        constants.SETTINGSPATH,
        JSON.stringify(defaultSettings),
        function (err) {
            if (err) {
                Log("Something went wrong with creating new settings file");
                Error(err.message);
            }
        }
    );
}
