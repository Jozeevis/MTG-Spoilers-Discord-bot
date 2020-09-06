import { TextChannel, DMChannel, NewsChannel } from 'discord.js';

import { Global } from '../../bot';
declare var global: Global;

import { Log } from '../common/logging';
import { saveWatchedSets } from '../common/io';

/**
 * Stops any current spoilerwatch for set with the given setcode in the given channel
 */
export function stopWatchCommand(channel: TextChannel | DMChannel | NewsChannel, set: string) {
    Log(`Checking spoilerwatch for set ${set}.`);
    Log(`Checking if set matches with ${set} and channel matches with ${channel.id}`);
    // Check if set is watched in the current channel
    if (
        global.watchedSetcodes &&
        global.watchedSetcodes.filter(function (watchedset) {
            watchedset.setCode == set && watchedset.channelID == channel.id;
        })
    ) {
        Log(`Stopping spoilerwatch for set ${set}.`);
        channel.send(`Stopping spoilerwatch for set ${set}.`);
        // Find the timeout for this set and channel
        global.savedIntervals.find((o, i) => {
            if (o.setcode == set && o.channel == channel.id) {
                // Stop the interval that checks for spoilers
                clearInterval(o.interval);
                global.savedIntervals.splice(i, 1);
                return true;
            }
            return false;
        });
        // Remove the set and channel combination from the watchedSetcodes and save it
        global.watchedSetcodes = global.watchedSetcodes.filter(function (watchedset) {
            watchedset.setCode != set || watchedset.channelID != channel.id;
        });
        saveWatchedSets();
    } else {
        channel.send(`No spoilerwatch for set ${set} is running in this channel.`);
    }
}
