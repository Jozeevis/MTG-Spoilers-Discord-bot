import { Log, Error } from '../common/logging.js';
import { getSavedCards, setSavedCards } from '../common/io.js';
import { generateCardMessage } from '../common/card-helper.js';
import { NewsChannel, TextChannel, DMChannel } from 'discord.js';
import { ICard } from '../../models/card.js';
import { scryfallGetSet } from '../common/scryfall.js';

/**
 * Finds all new cards in the given set that haven't been posted to the given channel yet and posts them there
 * @param {boolean} verbose If true, will send messages to the channel if no cards are found
 * @param {boolean} ignoreBasics If true, the standard basic lands will not be sent (plains, island, swamp, mountain, forest)
 */
export async function getNewCardsCommand(channel: TextChannel | DMChannel | NewsChannel, set: string, verbose = false, ignoreBasics = true) {
    if (verbose) {
        let message = `Trying to get newly spoiled cards from set with code ${set}`;
        if (ignoreBasics != false) {
            message += " (excluding basic lands)";
        }
        channel.send(`${message}...`);
    }

    let args = new GetNewSetArgs(set, channel.id, verbose);
    scryfallGetSet(set, ignoreBasics, _getNewSetMessages, args).then((messages) => {
        Log(`Sending ${messages.length} cards to channel with id ${channel.id}`);
        let interval = setInterval(
            function (messages) {
                if (messages.length <= 0) {
                    Log(`Done with sending cards to channel with id ${channel.id}`);
                    clearInterval(interval);
                }
                else {
                    let message = messages.pop();
                    channel.send(message);
                }
            },
            1000,
            messages
        );
    }).catch((err) => {
        channel.send(err);
    });
}

async function _getNewSetMessages(cards: ICard[], args?: { [key: string]: any }): Promise<string[]> {
    const getNewSetArgs = args as GetNewSetArgs;
    if (!getNewSetArgs) {
        console.log(getNewSetArgs);
        Error('YOU HECKED UP');
        return ['YOU HECKED UP'];
    }

    // Read which cards are already saved
    return getSavedCards(getNewSetArgs.set, getNewSetArgs.channelID).then((savedCardlist) => {
        // For every card: check if it's already saved, otherwise at it to the new list
        let newCardlist = new Array<ICard>();
        cards.forEach(function (card: ICard) {
            let cardId = card.oracle_id;

            if (!savedCardlist.some((c: string) => c == cardId)) {
                newCardlist.push(card);
                savedCardlist.push(cardId);
            }
        });

        // If new list is empty, no new cards were found
        if (newCardlist.length <= 0) {
            Log(`No new cards were found with set code ${getNewSetArgs.set}`);
            if (getNewSetArgs.verbose) {
                return Promise.reject([`No new cards were found with set code ${getNewSetArgs.set}.`]);
            }
            else {
                return [];
            }
        }

        // If new list wasn't empty, send one of the new cards to the channel every second
        Log(`${newCardlist.length} new cards were found with set code ${getNewSetArgs.set}`);

        // Save the updated list of saved cards to the datafile
        try {
            setSavedCards(getNewSetArgs.set, getNewSetArgs.channelID, savedCardlist);
        }
        catch (error) {
            Log("Something went wrong while saving new saved card data.");
            Error(error);
            if (getNewSetArgs.verbose) {
                return Promise.reject(['Something went wrong while trying to save new cards list.']);
            }
        }

        let messages = new Array<string>();
        newCardlist.forEach((card) => {
            let message = generateCardMessage(card);
            messages.push(message);
        });

        return messages;
    });
}

class GetNewSetArgs {
    constructor(
        public set: string,
        public channelID: string,
        public verbose: boolean,
    ) { }
}