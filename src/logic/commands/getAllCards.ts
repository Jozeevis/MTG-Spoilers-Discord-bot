import { GuildTextBasedChannel, TextBasedChannel } from 'discord.js';

import constants from '../constants';
import { ICard } from '../../models';
import { Log } from '../common/logging.js';
import { generateCardMessage } from '../common/card-helper';
import { scryfallGetSet } from '../common/scryfall';

/**
 * Finds all cards in the given set that and post them to the given channel
 * @param {*} ignoreBasics if true, will not post the standard basic lands (plains, island, swamp, mountain, forest)
 */
export function getAllCardsCommand(channel: GuildTextBasedChannel | TextBasedChannel, set: string, ignoreBasics = true) {
    let message = `Trying to get cards from set with code ${set}`;
    if (ignoreBasics != false) {
        message += ' (excluding basic lands)';
    }
    channel.send(`${message}...`);

    scryfallGetSet(set, ignoreBasics, _getSetMessages).then((messages) => {
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
            constants.MESSAGEINTERVAL,
            messages
        );
    }).catch((err) => {
        channel.send(err);
    });
}

function _getSetMessages(cards: ICard[]): Promise<string[]> {
    let messages = new Array<string>();
    cards.forEach((card) => {
        let message = generateCardMessage(card);
        messages.push(message);
    })
    return Promise.resolve(messages);
}