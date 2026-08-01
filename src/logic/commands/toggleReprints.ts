import { GuildTextBasedChannel, TextBasedChannel, SlashCommandBuilder, CommandInteraction } from 'discord.js';

import { writeShowReprints } from '../common/io';
import { TrySend } from '../common/discord';

/**
 * Toggles the global setting whether to show reprints or not
 */
export function toggleReprintCommand(channel: GuildTextBasedChannel | TextBasedChannel) {
    let newValue = _toggleReprintsValue();
    TrySend(channel, _getMessage(newValue));
}

module.exports = {
	data: new SlashCommandBuilder().setName('toggle-reprints').setDescription('Toggle whether the bot will include reprints when showing new cards.'),
	async execute(interaction: CommandInteraction) {
        let newValue = _toggleReprintsValue();
		await interaction.reply(_getMessage(newValue));
	},
};

function _toggleReprintsValue(): boolean {
    let newValue = !global.showReprints;
    writeShowReprints(newValue);
    global.showReprints = newValue;
    return newValue;
}

function _getMessage(newValue: boolean): string {
    return newValue ? 'The bot will now include reprints when sending unseen cards.' : 'The bot will no longer include reprints when sending unseen cards.';
}