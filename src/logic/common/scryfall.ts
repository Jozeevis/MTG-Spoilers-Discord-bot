import https from 'https';
import { ICard, ICardList } from '../../models';
import { Log, Error } from './logging';
import constants from './constants';

const GET_CARD_ERROR = 'Something went wrong searching for your card, please wait a moment and try again';
const GET_SET_ERROR = 'Something went wrong getting data for that set, please wait a moment and try again';

export function scryfallGetCard(name: string, callback: (card: ICard, attemptedName: string) => string): Promise<string> {
    return new Promise((resolve, reject) => {
        // Make a request to the Scryfall api
        https.get(`https://api.scryfall.com/cards/named?fuzzy=${name}`, (resp) => {
            let data = '';

            // A chunk of data has been received.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received.
            resp.on('end', () => {
                let card: ICard;
                try {
                    // Parse the data in the response
                    let cardData = JSON.parse(data);
                    card = cardData as ICard;
                    if (card) {
                        Log(`Found card with name like ${name}: ${card.name}`);
                        resolve(callback(card, name));
                    }
                    else {
                        Log('Expected \'card\' object from Scryfall but could not parse, got the following:');
                        Log(cardData);
                        reject(GET_CARD_ERROR);
                    }
                } catch (error) {
                    Log('Something went wrong while trying to parse data from Scryfall.');
                    Error(error);
                    reject(GET_CARD_ERROR);
                }
            });
        })
            .on('error', (err) => {
                Log('Something went wrong while trying to get card data from Scryfall.');
                Error(err.message);
                reject(GET_CARD_ERROR);
            });
    });
}

export function scryfallGetSet(set: string, ignoreBasics: boolean, callback: (cards: ICard[], args?: { [key: string]: any }) => Promise<string[]>, args?: { [key: string]: any }): Promise<string[]> {
    return new Promise((resolve, reject) => {
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
                    let cardlist: ICardList;
                    try {
                        // Parse the data in the response
                        let cardlistData = JSON.parse(data);
                        cardlist = cardlistData as ICardList;
                        if (cardlist) {
                            if (cardlist.object === 'list') {
                                // Log any warnings in the API response
                                if (cardlist.warnings) {
                                    cardlist.warnings.forEach((warning) => {
                                        Log(warning);
                                    })
                                }

                                // Remove basics from the list if ignored
                                if (ignoreBasics) {
                                    Log('Ignoring basic lands');
                                    cardlist.data = cardlist.data.filter((card: ICard) => {
                                        return !constants.BASICLANDNAMES.includes(
                                            card.name.toLowerCase()
                                        );
                                    });
                                }

                                // If new list is empty, no new cards were found
                                if (!cardlist.total_cards || cardlist.total_cards <= 0) {
                                    Log(`No cards were found with set code ${set}`);
                                    reject(`No cards were found with set code ${set}.`);
                                } else {
                                    // If new list wasn't empty, send one of the new cards to the channel every second
                                    Log(`${cardlist.total_cards} cards were found with set code ${set}`);
                                    resolve(callback(cardlist.data, args));
                                }
                            }
                            else {
                                Log(`Expected \'list\' object from Scryfall but got type \'${cardlist.object}\', with the following data`);
                                Log(cardlistData);
                                reject(GET_SET_ERROR);
                            }
                        }
                        else {
                            Log('Expected \'list\' object from Scryfall but could not parse, got the following:');
                            Log(cardlistData);
                            reject(GET_SET_ERROR);
                        }
                    } catch (error) {
                        Log('Something went wrong with parsing data from Scryfall.');
                        Error(error);
                        reject(GET_SET_ERROR);
                    }
                });
            }
        )
            .on('error', (err) => {
                Log('Something went wrong while trying to get set data from Scryfall.');
                Error(err.message);
                reject(GET_SET_ERROR);
            });
    });
}