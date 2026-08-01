import { GuildTextBasedChannel, TextBasedChannel, SlashCommandBuilder, CommandInteraction } from 'discord.js';
import { TrySend } from '../common/discord';

/**
 * Posts a message with all available commands to the given channel
 * Uses the given prefix in its command outlines
 */
export function helpCommand(channel: GuildTextBasedChannel | TextBasedChannel, prefix: string) {
    let helpMessage = _createHelpMessage(prefix);

    TrySend(channel, helpMessage);
}

module.exports = {
	data: new SlashCommandBuilder().setName('help').setDescription('Will show all possible commands and usages.'),
	async execute(interaction: CommandInteraction) {
		await interaction.reply(_createHelpMessage("/"));
	},
};

function _createHelpMessage(prefix: string): string {
    let helpMessageLines = [];

    helpMessageLines.push('List of all possible commands:');
    helpMessageLines.push(`**${prefix}get <name>**: Responds with a single card with name like the given name.`);
    helpMessageLines.push(`**${prefix}getall <setcode>**: Responds with all cards from set with the given (3-character) setcode.`);
    helpMessageLines.push(`**${prefix}getnew <setcode>**: Responds with all new cards from set with the given (3-character) setcode that have not been send in that channel yet.`);
    helpMessageLines.push(`**${prefix}watch <setcode>**: Starts a spoilerwatch for set with the given (3-character) setcode, posting any new cards as they get added to Scryfall.`);
    helpMessageLines.push(`**${prefix}unwatch <setcode>**: Stops the spoilerwatch for set with the given (3-character) setcode.`);
    helpMessageLines.push(`**${prefix}clear <setcode>**: Clears any saved data regarding sent cards for set with the given (3-character) setcode.`);
    helpMessageLines.push(`**${prefix}prefix <prefix>**: Changes the prefix for commands the bot responds to. Defaults to '!'.`);
    helpMessageLines.push(`**${prefix}reprints**: Toggles whether the bot will show reprints when posting unseen cards or not. Defaults to true.`);
    helpMessageLines.push(`**${prefix}ping**: Responds with 'Pong!'.`);
    helpMessageLines.push(`**${prefix}help**: You are here!`);

    return helpMessageLines.join('\n');
}