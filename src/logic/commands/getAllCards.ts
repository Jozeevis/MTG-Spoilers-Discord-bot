import { Log } from '../common/logging.js';
import { generateCardMessage } from '../common/card-helper.js';
import { TextChannel, DMChannel, NewsChannel } from 'discord.js';
import { ICard } from '../../models/card.js';
import { scryfallGetSet } from '../common/scryfall.js';

/**
 * Finds all cards in the given set that and post them to the given channel
 * @param {*} ignoreBasics if true, will not post the standard basic lands (plains, island, swamp, mountain, forest)
 */
export async function getAllCardsCommand(channel: TextChannel | DMChannel | NewsChannel, set: string, ignoreBasics = true) {
    let message = `Trying to get cards from set with code ${set}`;
    if (ignoreBasics != false) {
        message += ' (excluding basic lands)';
    }
    channel.send(`${message}...`);

    let messages = await scryfallGetSet(set, ignoreBasics, _getSetMessages);
    if (messages) {
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
    }
}

function _getSetMessages(cards: ICard[]): Promise<string[]> {
    let messages = new Array<string>();
    cards.forEach((card) => {
        let message = generateCardMessage(card);
        messages.push(message);
    })
    return Promise.resolve(messages);
}