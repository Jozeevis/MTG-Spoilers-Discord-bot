import { ChatInputCommandInteraction, GuildTextBasedChannel, MessageFlags, SlashCommandBuilder, TextBasedChannel } from 'discord.js';

import constants from '../constants';
import { ICard } from '../../models';
import { Log } from '../common/logging.js';
import { generateCardMessage } from '../common/card-helper';
import { scryfallGetSet } from '../common/scryfall';
import { TrySend } from '../common/discord';

/**
 * Finds all cards in the given set that and post them to the given channel
 * @param {*} ignoreBasics if true, will not post the standard basic lands (plains, island, swamp, mountain, forest)
 */
export function getAllCardsCommand(channel: GuildTextBasedChannel | TextBasedChannel, set: string, ignoreBasics: boolean = true) {
    let message = `Trying to get cards from set with code ${set}`;
    if (ignoreBasics != false) {
        message += ' (excluding basic lands)';
    }
    TrySend(channel, `${message}...`);

    _getSet(set, ignoreBasics, channel.id).then((messages) => {
        let interval = setInterval(
            function (messages) {
                if (messages.length <= 0) {
                    Log(`Done with sending cards to channel with id ${channel.id}`);
                    clearInterval(interval);
                }
                else {
                    let message = messages.pop();
                    if (message) {
                        TrySend(channel, message);
                    }
                }
            },
            constants.MESSAGEINTERVAL,
            messages
        );
    }).catch((err) => {
        TrySend(channel, err);
    })
}

const setcodeOptionName = 'setcode';
const ignoreBasicsOptionName = 'ignore-basics';

export const data = new SlashCommandBuilder()
    .setName('get_all')
    .setDescription('Get all cards from the given set.')
    .addStringOption((option) => 
        option.setName(setcodeOptionName)
        .setDescription('The set code for the set to be retrieved')
        .setRequired(true)
        .setMaxLength(constants.SETCODEMAXLENGTH)
    ).addBooleanOption((option) => 
        option.setName(ignoreBasicsOptionName)
        .setDescription("Whether to ignore basics, if true basics won't be included in the results")
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const setCode = interaction.options.getString(setcodeOptionName);
    if (setCode === null) {
        await interaction.reply({ content: 'You need to enter the set code to retrieve', flags: MessageFlags.Ephemeral });
    }
    const ignoreBasics = interaction.options.getBoolean(ignoreBasicsOptionName) ?? false;
    await interaction.deferReply();
    try {
        let messages = await _getSet(setCode as string, ignoreBasics, interaction.channelId);
        let interval = setInterval(
            async function (messages) {
                if (messages.length <= 0) {
                    Log(`Done with sending cards to channel with id ${interaction.channelId}`);
                    clearInterval(interval);
                }
                else {
                    let message = messages.pop();
                    if (message) {
                        await interaction.followUp(message);
                    }
                }
            },
            constants.MESSAGEINTERVAL,
            messages
        );
    }
    catch (err) {
        await interaction.editReply(err as string);
    }
};

async function _getSet(set: string, ignoreBasics: boolean, channelId: string): Promise<string[]> {
    return scryfallGetSet(set, ignoreBasics, true, _getSetMessages).then((messages) => {
        Log(`Sending ${messages.length} cards to channel with id ${channelId}`);
        return Promise.resolve(messages);
    }).catch((err) => {
        return Promise.reject(err);
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