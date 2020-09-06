import fs from 'fs';
import { TextChannel, DMChannel, NewsChannel } from 'discord.js';

import { getFilename } from '../common/io';
import { Log, Error } from '../common/logging';

/**
 * Clears saved data for any cards already sent for set with given setcode in given channel
 */
export function clearCommand(channel: TextChannel | DMChannel | NewsChannel, set: string) {
    let fileName = getFilename(set, channel.id);
    try {
        fs.writeFile(fileName, '[]', (err) => {
            if (err) {
                channel.send(`Something went wrong with clearing file for set with code ${set}.`);
                Log(`Something went wrong with clearing file ${fileName} for set with code ${set}.`);
                Error(err.message);
                return;
            }
            Log(`Successfully cleared file ${fileName}.`);
        });
        channel.send(`Successfully cleared file for set with code ${set}.`);
    } catch (error) {
        channel.send(`Something went wrong with clearing file for set with code ${set}.`);
        Log(`Something went wrong with clearing file ${fileName} for set with code ${set}.`);
        Error(error);
    }
}
