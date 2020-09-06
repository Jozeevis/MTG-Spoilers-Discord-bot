import { TextChannel, DMChannel, NewsChannel } from 'discord.js';

import { Global } from '../../bot';
declare var global: Global;

import { writePrefix } from '../common/io';

/**
 * Changes the prefix for the bot to the given new prefix
 */
export function prefixCommand(channel: TextChannel | DMChannel | NewsChannel, newPrefix: string) {
    let oldPrefix = global.prefix;
    writePrefix(newPrefix);
    global.prefix = newPrefix;
    channel.send(`Changed prefix from '${oldPrefix}' to '${newPrefix}'.`);
}
