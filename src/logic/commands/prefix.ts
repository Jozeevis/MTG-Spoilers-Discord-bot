import { Global } from '../../bot.js';
declare var global: Global;

import { writePrefix } from '../data-io.js';
import { TextChannel, DMChannel, NewsChannel } from 'discord.js';

/**
 * Changes the prefix for the bot to the given new prefix
 */
export function prefixCommand(channel: TextChannel | DMChannel | NewsChannel, newPrefix: string) {
    let oldPrefix = global.prefix;
    writePrefix(newPrefix);
    global.prefix = newPrefix;
    channel.send(`Changed prefix from '${oldPrefix}' to '${newPrefix}'.`);
}
