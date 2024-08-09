import https from 'https';
import { ICard, ICardList } from '../../models';
import { Log, Error } from './logging';
import constants from '../constants';

const GET_CARD_ERROR = 'Something went wrong searching for your card, please wait a moment and try again';
const GET_SET_ERROR = 'Something went wrong getting data for that set, please wait a moment and try again';

export async function scryfallGetCard(name: string, callback: (card: ICard, attemptedName: string) => Promise<string>): Promise<string> {
    let data = await makeScryfallAPICall(`https://api.scryfall.com/cards/named?fuzzy=${name}`).catch((err) => {
        return Promise.reject(err);
    });
    let card = await _parseCard(data, name).catch((err) => {
        return Promise.reject(err);
    });
    return callback(card, name);
}

function _parseCard(data: string, name: string): Promise<ICard> {
    return new Promise((resolve, reject) => {
        let card: ICard;
        try {
            // Parse the data in the response
            let cardData = JSON.parse(data);
            card = cardData as ICard;
            if (card) {
                Log(`Found card with name like ${name}: ${card.name}`);
                resolve(card);
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
    })
}

export async function scryfallGetSet(set: string, ignoreBasics: boolean, callback: (cards: ICard[], args?: { [key: string]: any }) => Promise<string[]>, args?: { [key: string]: any }): Promise<string[]> {
    const endpoint = `https://api.scryfall.com/cards/search?order=spoiled&q=e%3A${set}&unique=prints`;
    let data = await makeScryfallAPICall(endpoint).catch((err) => {
        return Promise.reject(err);
    });
    let cardlist = await _parseSet(data, set, ignoreBasics).catch((err) => {
        return Promise.reject(err);
    });
    let cards = cardlist.data;
    while (cardlist.has_more && cardlist.next_page) {
        Log(`Response was paginated, trying to get next page from ${cardlist.next_page}.`);
        Log(`Currently at ${cards.length} cards out of a total ${cardlist.total_cards}.`);
        await new Promise(resolve => setTimeout(resolve, constants.APICALLINTERVAL));
        data = await makeScryfallAPICall(cardlist.next_page).catch((err) => {
            return Promise.reject(err);
        });
        cardlist = await _parseSet(data, set, ignoreBasics).catch((err) => {
            return Promise.reject(err);
        });
        cards = cards.concat(cardlist.data);
    }

    return callback(cards, args);
}

async function _parseSet(data: string, set: string, ignoreBasics: boolean): Promise<ICardList> {
    return new Promise((resolve, reject) => {
        try {
            // Parse the data in the response
            let cardlistData = JSON.parse(data);
            let cardlist = cardlistData as ICardList;
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
                        Log(`${cardlist.data.length} cards were found with set code ${set} out of a total of ${cardlist.total_cards}`);
                        resolve(cardlist);
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

function makeScryfallAPICall(endpoint: string): Promise<string> {
    return new Promise((resolve, reject) => {
        // Make a request to the Scryfall api
        https.get(
            endpoint,
            {headers : {['User-Agent']: 'DiscordSpoilerbot1.0', Accept: 'application/json'}},
            (resp) => {
                let data = '';

                // A chunk of data has been received.
                resp.on('data', (chunk) => {
                    data += chunk;
                });

                // The whole response has been received.
                resp.on('end', () => {
                    return resolve(data);
                });
            }
        )
            .on('error', (err) => {
                Log('Something went wrong while trying to get data from Scryfall.');
                Error(err.message);
                return reject(GET_SET_ERROR);
            });
    })
}
