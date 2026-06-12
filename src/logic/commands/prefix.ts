import { GuildTextBasedChannel, TextBasedChannel } from 'discord.js';

import { writePrefix } from '../common/io';
import { TrySend } from '../common/discord';

/**
 * Changes the prefix for the bot to the given new prefix
 */
export function prefixCommand(channel: GuildTextBasedChannel | TextBasedChannel, newPrefix: string) {
    let oldPrefix = global.prefix;
    writePrefix(newPrefix);
    global.prefix = newPrefix;
    TrySend(channel, `Changed prefix from '${oldPrefix}' to '${newPrefix}'.`);
}
