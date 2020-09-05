import { Log } from '../common/logging.js';
import { saveWatchedSets } from '../data-io.js';
import { startSpoilerWatch } from '../spoilerWatches.js';
import { getNewCards } from '../commands.js';

/* global watchedSetcodes, savedIntervals  */

/**
 * Starts spoilerwatch for set with the given setcode in the given channel
 */
export function startWatch(channel, set) {
    //Add the combination to the watched sets and save this
    watchedSetcodes.push({ setCode: set, channelID: channel.id });
    saveWatchedSets();
    Log(`Starting spoilerwatch for set ${set}.`);
    channel.send(`Starting spoilerwatch for set ${set}.`);

    //Immediately look for new cards
    Log(`Start looking for new cards on ${Date.now()}`);
    getNewCards(channel, set);
    //Start the interval to look for new cards
    let interval = startSpoilerWatch(channel, set);
    savedIntervals.push({
        setcode: set,
        channel: channel.id,
        interval: interval,
    });
}