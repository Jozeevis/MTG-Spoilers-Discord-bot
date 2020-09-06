import { TextChannel, DMChannel, NewsChannel } from 'discord.js';

import { ICard } from '../../models';
import { generateCardMessage } from '../common/card-helper.js';
import { scryfallGetCard } from '../common/scryfall.js';

/**
 * Tries to find card with the given name and post it to the given channel
 * Uses Scryfall fuzzy search
 */
export function getCardCommand(channel: TextChannel | DMChannel | NewsChannel, name: string) {
    scryfallGetCard(name, _getCardMessage).then((message) => {
        channel.send(message);
    }).catch((err) => {
        channel.send(err);
    });
}

function _getCardMessage(card: ICard, attemptedName: string): Promise<string> {
    if (card.object === 'card') {
        let message = generateCardMessage(card);
        return Promise.resolve(message);
    }
    else {
        if (card.object == 'error') {
            if (card.type == 'ambiguous') {
                return Promise.reject(`Found multiple cards with name like ${attemptedName}. Please try to make a more specific query by adding more words.`);
            } else {
                return Promise.reject(`Did not find any card with name like ${attemptedName}.`);
            }
        }
    }
    return Promise.reject('Something went wrong, please try again');
}
