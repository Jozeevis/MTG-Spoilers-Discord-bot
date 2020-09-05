import fs from 'fs';

import { getFilename } from '../common/io.js';
import { Log, Error } from '../common/logging.js';

/**
 * Clears saved data for any cards already sent for set with given setcode in given channel
 */
export function clear(channel, set) {
    let fileName = getFilename(set, channel.id);
    try {
        fs.writeFile(fileName, '[]', (error) => {
            if (error) {
                channel.send(`Something went wrong with clearing file for set with code ${set}.`);
                Log(`Something went wrong with clearing file ${fileName} for set with code ${set}.`);
                Error(error);
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
