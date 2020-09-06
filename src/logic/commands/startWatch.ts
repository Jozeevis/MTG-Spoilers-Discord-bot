import { Global } from '../../bot.js';
declare var global: Global;

import { Log } from '../common/logging.js';
import { saveWatchedSets } from '../data-io.js';
import { startSpoilerWatch } from '../spoilerWatches.js';
import { getNewCards } from '../commands.js';
import { TextChannel, DMChannel, NewsChannel } from 'discord.js';
import { SavedInterval } from '../../models/saved-interval.js';
import { WatchedSetCode } from '../../models/watched-setcode.js';

/**
 * Starts spoilerwatch for set with the given setcode in the given channel
 */
export function startWatch(channel: TextChannel | DMChannel | NewsChannel, set: string) {
    //Add the combination to the watched sets and save this
    global.watchedSetcodes.push(new WatchedSetCode(set, channel.id));
    saveWatchedSets();
    Log(`Starting spoilerwatch for set ${set}.`);
    channel.send(`Starting spoilerwatch for set ${set}.`);

    //Immediately look for new cards
    Log(`Start looking for new cards on ${Date.now()}`);
    getNewCards(channel, set);
    //Start the interval to look for new cards
    let interval = startSpoilerWatch(channel, set);
    global.savedIntervals.push(new SavedInterval(set, channel.id, interval));
}