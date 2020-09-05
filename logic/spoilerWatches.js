import constants from './constants.js';
import { Log } from './common/logging.js';
import { getNewCards } from './commands.js';

/* global bot, watchedSetcodes, savedIntervals  */

/**
 * Start the interval to look for new cards for the given set and channelID
 */
export function startSpoilerWatch(channel, set) {
    return setInterval(
        function (set) {
            Log(`Start looking for new cards in set ${set} for channel ${channel.id}`);
            getNewCards(channel, set);
        },
        constants.SPOILERWATCHINTERVALTIME,
        set
    );
}

/**
 * Starts spoiler watches for all saved watched setcodes
 */
export function startSpoilerWatches() {
    Log(`Watched sets: ${JSON.stringify(watchedSetcodes)}`);
    for (let i = 0; i < watchedSetcodes.length; i++) {
        let watchedSet = watchedSetcodes[i];
        Log(`Watched set: ${JSON.stringify(watchedSet)}`);
        Log(`Start looking for new cards in set ${watchedSet.setCode} for channel ${watchedSet.channelID}`)
        let channel = bot.channels.cache.get(watchedSet.channelID);
        let interval = startSpoilerWatch(
            channel,
            watchedSet.setCode
        );
        savedIntervals.push({
            setcode: watchedSet.setCode,
            channel: channel.id,
            interval: interval,
        });
        getNewCards(channel, watchedSet.setCode);
    }
    return;
}
