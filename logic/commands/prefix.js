import { writePrefix } from '../data-io.js';

/* global prefix:writable */

/**
 * Changes the prefix for the bot to the given new prefix
 */
export function prefixCommand(channel, newPrefix) {
    let oldPrefix = prefix;
    writePrefix(newPrefix);
    prefix = newPrefix;
    channel.send(`Changed prefix from '${oldPrefix}' to '${newPrefix}'.`);
}
