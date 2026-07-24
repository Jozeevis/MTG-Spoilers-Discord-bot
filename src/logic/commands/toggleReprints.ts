import { GuildTextBasedChannel, TextBasedChannel } from 'discord.js';

import { writeShowReprints } from '../common/io';
import { TrySend } from '../common/discord';

/**
 * Toggles the global setting whether to show reprints or not
 */
export function toggleReprintCommand(channel: GuildTextBasedChannel | TextBasedChannel) {
    let newValue = !global.showReprints;
    writeShowReprints(newValue);
    global.showReprints = newValue;
    TrySend(channel, newValue ? 'The bot will now include reprints when sending unseen cards.' : 'The bot will no longer include reprints when sending unseen cards.');
}
