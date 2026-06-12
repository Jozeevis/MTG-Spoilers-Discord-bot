import fs from 'fs';
import { GuildTextBasedChannel, TextBasedChannel } from 'discord.js';

import { getFilename } from '../common/io';
import { Log, Error } from '../common/logging';
import { TrySend } from '../common/discord';

/**
 * Clears saved data for any cards already sent for set with given setcode in given channel
 */
export function clearCommand(channel: GuildTextBasedChannel | TextBasedChannel, set: string) {
    let fileName = getFilename(set, channel.id);
    try {
        fs.writeFile(fileName, '[]', (err) => {
            if (err) {
                TrySend(channel, `Something went wrong with clearing file for set with code ${set}.`);
                Log(`Something went wrong with clearing file ${fileName} for set with code ${set}.`);
                Error(err.message);
                return;
            }
            Log(`Successfully cleared file ${fileName}.`);
        });
        TrySend(channel, `Successfully cleared file for set with code ${set}.`);
    } catch (error) {
        TrySend(channel, `Something went wrong with clearing file for set with code ${set}.`);
        Log(`Something went wrong with clearing file ${fileName} for set with code ${set}.`);
        Error(error);
    }
}
