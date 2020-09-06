import { generateCardMessage } from '../common/card-helper.js';
import { TextChannel, DMChannel, NewsChannel } from 'discord.js';
import { scryfallGetCard } from '../common/scryfall.js';
import { ICard } from '../../models';

/**
 * Tries to find card with the given name and post it to the given channel
 * Uses Scryfall fuzzy search
 */
export async function getCardCommand(channel: TextChannel | DMChannel | NewsChannel, name: string) {
    let message = await scryfallGetCard(name, _getCardMessage);
    if (message) {
        channel.send(message);
    }
}

function _getCardMessage(card: ICard, attemptedName: string): string {
    if (card.object === 'card') {
        let message = generateCardMessage(card);
        return message;
    }
    else {
        if (card.object == 'error') {
            if (card.type == 'ambiguous') {
                return `Found multiple cards with name like ${attemptedName}. Please try to make a more specific query by adding more words.`;
            } else {
                return `Did not find any card with name like ${attemptedName}.`;
            }
        }
    }
    return 'Something went wrong, please try again';
}
