import fs from 'fs';
import { GuildTextBasedChannel, TextBasedChannel, SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from 'discord.js';

import constants from '../constants';
import { getFilename } from '../common/io';
import { Log, Error } from '../common/logging';
import { TrySend } from '../common/discord';

/**
 * Clears saved data for any cards already sent for set with given setcode in given channel
 */
export function clearCommand(channel: GuildTextBasedChannel | TextBasedChannel, set: string) {
    let message = _clearSet(channel.id, set);
    TrySend(channel, message);
}

const setcodeOptionName = 'setcode';

export const data = new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clear list of seen cards for given set. Will count all cards in set as unseen again.')
    .addStringOption((option) => 
        option.setName(setcodeOptionName)
        .setDescription('The set code for the set to be cleared')
        .setRequired(true)
        .setMaxLength(constants.SETCODEMAXLENGTH)
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const setCode = interaction.options.getString(setcodeOptionName);
    if (setCode === null) {
        await interaction.reply({ content: 'You need to enter the set code to clear', flags: MessageFlags.Ephemeral });
    }
    let message = _clearSet(interaction.channelId, setCode as string);
    await interaction.reply({ content: message, flags: MessageFlags.Ephemeral });
};

function _clearSet(channelId: string, setCode: string): string {
    let fileName = getFilename(setCode, channelId);
    try {
        fs.writeFile(fileName, '[]', (err) => {
            if (err) {
                Log(`Something went wrong with clearing file ${fileName} for set with code ${setCode}.`);
                Error(err.message);
                return `Something went wrong with clearing file for set with code ${setCode}.`;
            }
            Log(`Successfully cleared file ${fileName}.`);
            return;
        });
        return `Successfully cleared file for set with code ${setCode}.`;
    } catch (error) {
        Log(`Something went wrong with clearing file ${fileName} for set with code ${setCode}.`);
        Error(error);
        return `Something went wrong with clearing file for set with code ${setCode}.`;
    }
}