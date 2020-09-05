import https from 'https';

import { Log } from '../common/logging.js';
import { generateCardMessage } from '../card-helper.js';
import constants from '../constants.js';

/**
 * Finds all cards in the given set that and post them to the given channel
 * @param {*} ignoreBasics if true, will not post the standard basic lands (plains, island, swamp, mountain, forest)
 */
export function getAllCards(channel, set, ignoreBasics = true) {
    ignoreBasics = ignoreBasics != 'false';
    let message = `Trying to get cards from set with code ${set}`;
    if (ignoreBasics != false) {
        message += ' (excluding basic lands)';
    }
    channel.send(`${message}...`);

    // Make a request to the Scryfall api
    https.get(
        `https://api.scryfall.com/cards/search?order=spoiled&q=e%3A${set}&unique=prints`,
        (resp) => {
            let data = '';

            // A chunk of data has been received.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received.
            resp.on('end', () => {
                let cardlist = null;
                try {
                    // Parse the data in the response
                    cardlist = JSON.parse(data);
                } catch (error) {
                    Log('Something went wrong with parsing data from Scryfall.');
                    Error(error);
                    return;
                }
                if (cardlist && cardlist.object == 'list') {
                    // Log any warnings in the API response
                    if (cardlist.warnings) {
                        Log(cardlist.warnings);
                    }

                    if (ignoreBasics) {
                        Log('Ignoring basic lands');
                        cardlist.data = cardlist.data.filter((card) => {
                            return !constants.BASICLANDNAMES.includes(
                                card.name.toLowerCase()
                            );
                        });
                    }

                    // If new list is empty, no new cards were found
                    if (cardlist.total_cards <= 0) {
                        Log(`No cards were found with set code ${set}`);
                        channel.send(`No cards were found with set code ${set}.`);
                    } else {
                        // If new list wasn't empty, send one of the new cards to the channel every second
                        Log(`${cardlist.total_cards} cards were found with set code ${set}`);
                        let interval = setInterval(
                            function (cards) {
                                if (cards.length <= 0) {
                                    Log('Done with sending cards to channel.');
                                    clearInterval(interval);
                                } else {
                                    let card = cards.pop();
                                    let message = generateCardMessage(card);
                                    channel.send(message);
                                }
                            },
                            1000,
                            cardlist.data
                        );
                    }
                } else {
                    channel.send(`Did not find any card with set code ${set}.`);
                }
            });
        }
    )
        .on('error', (err) => {
            Error(err.message);
            channel.send(`Error trying to get cards with set code ${set}.\nCheck the console for more details.`);
        });
}
