import { TextChannel, DMChannel, NewsChannel } from 'discord.js';

/**
 * Posts a message with all available commands to the given channel
 * Uses the given prefix in its command outlines
 */
export function helpCommand(channel: TextChannel | DMChannel | NewsChannel, prefix: string) {
    let helpMessage = [];

    helpMessage.push('List of all possible commands:');
    helpMessage.push(`**${prefix}get <name>**: Responds with a single card with name like the given name.`);
    helpMessage.push(`**${prefix}getall <setcode>**: Responds with all cards from set with the given (3-character) setcode.`);
    helpMessage.push(`**${prefix}getnew <setcode>**: Responds with all new cards from set with the given (3-character) setcode that have not been send in that channel yet.`);
    helpMessage.push(`**${prefix}watch <setcode>**: Starts a spoilerwatch for set with the given (3-character) setcode, posting any new cards as they get added to Scryfall.`);
    helpMessage.push(`**${prefix}unwatch <setcode>**: Stops the spoilerwatch for set with the given (3-character) setcode.`);
    helpMessage.push(`**${prefix}clear <setcode>**: Clears any saved data regarding sent cards for set with the given (3-character) setcode.`);
    helpMessage.push(`**${prefix}prefix <prefix>**: Changes the prefix for commands the bot responds to. Defaults to '!'.`);
    helpMessage.push(`**${prefix}ping**: Responds with 'Pong!'.`);
    helpMessage.push(`**${prefix}help**: You are here!`);

    channel.send(helpMessage.join('\n'));
}
