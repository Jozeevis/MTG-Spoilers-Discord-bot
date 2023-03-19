import { GuildTextBasedChannel, TextBasedChannel } from 'discord.js';

import { Global } from '../../bot';
declare var global: Global;

import { SavedInterval, WatchedSetCode } from '../../models/';
import { getNewCardsCommand } from '../commands';
import { Log } from '../common/logging';
import { saveWatchedSets } from '../common/io';
import { startSpoilerWatch } from '../common/spoilerWatches';

/**
 * Starts spoilerwatch for set with the given setcode in the given channel
 */
export function startWatchCommand(channel: GuildTextBasedChannel | TextBasedChannel, set: string) {
    //Add the combination to the watched sets and save this
    global.watchedSetcodes.push(new WatchedSetCode(set, channel.id));
    saveWatchedSets();
    Log(`Starting spoilerwatch for set ${set}.`);
    channel.send(`Starting spoilerwatch for set ${set}.`);

    //Immediately look for new cards
    Log(`Start looking for new cards on ${Date.now()}`);
    getNewCardsCommand(channel, set);
    //Start the interval to look for new cards
    let interval = startSpoilerWatch(channel, set);
    global.savedIntervals.push(new SavedInterval(set, channel.id, interval));
}