import fs from 'fs';
import https from 'https';

import constants from '../constants.js';
import { Log, Error } from '../common/Logging.js';
import { getFilename } from '../common/io.js';
import { generateCardMessage } from '../card-helper.js';

/**
 * Finds all new cards in the given set that haven't been posted to the given channel yet and posts them there
 * @param {*} verbose If true, will send messages to the channel if no cards are found
 * @param {*} ignoreBasics If true, the standard basic lands will not be sent (plains, island, swamp, mountain, forest)
 */
export function getNewCards(channel, set, verbose = false, ignoreBasics = true) {
    ignoreBasics = ignoreBasics != 'false';
    // Read which cards are already saved
    let fileName = getFilename(set, channel.id);
    let savedCardlist = JSON.parse("[]");
    fs.exists(fileName, (exists) => {
        if (!exists) {
            // If data file doesn't exist yet, make an empty one
            fs.writeFile(fileName, "[]", (err) => {
                if (err) {
                    Log("Something went wrong with writing new data file.");
                    Error(err);
                }
                Log(`Successfully written to file ${fileName}.`);
            });
        } else {
            // If data file does exist, try to read it
            try {
                fs.readFile(fileName, function (err, buf) {
                    if (err) {
                        Log("Something went wrong with reading existing saved file.");
                        Error(err);
                    }
                    savedCardlist = JSON.parse(buf);
                    Log(`Successfully read file ${fileName}.`);
                });
            } catch (error) {
                Log("Something went wrong with parsing data from existing saved file.");
                Error(error);
                return;
            }
        }

        if (verbose) {
            let message = `Trying to get newly spoiled cards from set with code ${set}`;
            if (ignoreBasics != false) {
                message += " (excluding basic lands)";
            }
            channel.send(`${message}...`);
        }

        // Make a request to the Scryfall api
        https
            .get(
                `https://api.scryfall.com/cards/search?order=spoiled&q=e%3A${set}&unique=prints`,
                (resp) => {
                    let data = "";

                    // A chunk of data has been received.
                    resp.on("data", (chunk) => {
                        data += chunk;
                    });

                    // The whole response has been received.
                    resp.on("end", () => {
                        let cardlist = null;
                        try {
                            // Parse the data in the response
                            cardlist = JSON.parse(data);
                        } catch (error) {
                            Log("Something went wrong with parsing data from Scryfall.");
                            Error(error);
                            return;
                        }

                        if (ignoreBasics) {
                            Log("Ignoring basic lands");
                            cardlist.data = cardlist.data.filter((card) => {
                                return !constants.BASICLANDNAMES.includes(card.name.toLowerCase());
                            });
                        }

                        let newCardlist = [];
                        if (cardlist && cardlist.object == "list" && cardlist.total_cards > 0) {
                            // For every card: check if it's already saved, otherwise at it to the new list
                            cardlist.data.forEach(function (card) {
                                let cardId = card.oracle_id;

                                if (!savedCardlist.some((c) => c == cardId)) {
                                    newCardlist.push(card);
                                    savedCardlist.push(cardId);
                                }
                            });

                            // If new list is empty, no new cards were found
                            if (newCardlist.length <= 0) {
                                Log(`No new cards were found with set code ${set}`);
                                if (verbose) {
                                    channel.send(`No new cards were found with set code ${set}.`);
                                }
                            } else {
                                // If new list wasn't empty, send one of the new cards to the channel every second
                                Log(`${newCardlist.length} new cards were found with set code ${set}`);
                                let interval = setInterval(
                                    function (cards) {
                                        if (cards.length <= 0) {
                                            Log("Done with sending cards to channel.");
                                            clearInterval(interval);
                                        } else {
                                            // Get all relevant data from the card
                                            let card = cards.pop();
                                            let message = generateCardMessage(card);
                                            channel.send(message);
                                        }
                                    },
                                    1000,
                                    newCardlist
                                );

                                try {
                                    // Save the updated list of saved cards to the datafile
                                    let savedCardlistJSON = JSON.stringify(savedCardlist);
                                    fs.writeFile(fileName, savedCardlistJSON, function (err) {
                                        if (err) {
                                            Log("Something went wrong with saving file.");
                                            Error(err);
                                        }
                                        Log("New card list has succesfully been saved!");
                                    });
                                } catch (error) {
                                    Log("Something went wrong with saving new data.");
                                    Error(error);
                                    return;
                                }
                            }
                        } else {
                            if (verbose) {
                                channel.send(`Did not find any card with set code ${set}.`);
                            }
                        }
                    });
                }
            )
            .on("error", (err) => {
                Error(err.message);
                channel.send(`Error trying to get cards with set code ${set}.\nCheck the console for more details.`);
            });
    });
}
