import { GuildTextBasedChannel, TextBasedChannel, SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from 'discord.js';

import { writePrefix } from '../common/io';
import { TrySend } from '../common/discord';
import constants from '../constants';

/**
 * Changes the prefix for the bot to the given new prefix
 */
export function prefixCommand(channel: GuildTextBasedChannel | TextBasedChannel, newPrefix: string) {
    let message = _changePrefix(newPrefix);
    TrySend(channel, message);
}

const prefixOptionName = 'prefix';

export const data = new SlashCommandBuilder()
    .setName('prefix')
    .setDescription('Toggle whether the bot will include reprints when showing new cards.')
    .addStringOption((option) => 
        option.setName(prefixOptionName)
        .setDescription('The new prefix to use')
        .setRequired(true)
        .setMaxLength(constants.PREFIXMAXLENGTH)
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const newPrefix = interaction.options.getString(prefixOptionName);
    if (newPrefix === null) {
        await interaction.reply({ content: 'You need to enter the new prefix to use', flags: MessageFlags.Ephemeral });
    }
    let message = _changePrefix(newPrefix as string);
    await interaction.reply({ content: message, flags: MessageFlags.Ephemeral });
};

function _changePrefix(newPrefix: string): string {
    let oldPrefix = global.prefix;
    writePrefix(newPrefix);
    global.prefix = newPrefix;

    return `Changed prefix from '${oldPrefix}' to '${newPrefix}'.`;
}