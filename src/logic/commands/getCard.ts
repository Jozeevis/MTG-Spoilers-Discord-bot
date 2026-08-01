import { GuildTextBasedChannel, TextBasedChannel, SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from 'discord.js';

import { ICard } from '../../models';
import { generateCardMessage } from '../common/card-helper.js';
import { scryfallGetCard } from '../common/scryfall.js';
import { TrySend } from '../common/discord';
import constants from '../constants';

/**
 * Tries to find card with the given name and post it to the given channel
 * Uses Scryfall fuzzy search
 */
export function getCardCommand(channel: GuildTextBasedChannel | TextBasedChannel, name: string) {
    _getCard(name).then((message) => {
        TrySend(channel, message);
    });
}

const cardNameOptionName = 'name';

export const data = new SlashCommandBuilder()
    .setName('get')
    .setDescription('Find a card matching the given name')
    .addStringOption((option) => 
        option.setName(cardNameOptionName)
        .setDescription('The card name to search for')
        .setRequired(true)
        .setMaxLength(constants.CARDNAMEMAXLENGTH)
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const cardName = interaction.options.getString(cardNameOptionName);
    if (cardName === null) {
        await interaction.reply({ content: 'You need to enter the a name to search for', flags: MessageFlags.Ephemeral });
    }
    await interaction.deferReply();
    let message = await _getCard(cardName as string);
    await interaction.editReply(message);
};

async function _getCard(name: string): Promise<string> {
    return scryfallGetCard(name, _getCardMessage).then((message) => {
        return Promise.resolve(message);
    }).catch((err) => {
        return Promise.resolve(err);
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
