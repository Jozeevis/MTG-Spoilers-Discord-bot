import { TextChannel, DMChannel, NewsChannel } from 'discord.js';

import { Global } from '../../bot';
declare var global: Global;


import constants from '../constants';
import { Log, Error } from './logging';
import { getNewCardsCommand } from '../commands';
import { SavedInterval } from '../../models';

/**
 * Start the interval to look for new cards for the given set and channelID
 */
export function startSpoilerWatch(channel: TextChannel | DMChannel | NewsChannel, set: string): NodeJS.Timeout {
    return setInterval(
        function (set) {
            Log(`Start looking for new cards in set ${set} for channel ${channel.id}`);
            getNewCardsCommand(channel, set);
        },
        constants.SPOILERWATCHINTERVALTIME,
        set
    );
}

/**
 * Starts spoiler watches for all saved watched setcodes
 */
export function startSpoilerWatches() {
    Log(`Watched sets: ${JSON.stringify(global.watchedSetcodes)}`);
    for (let i = 0; i < global.watchedSetcodes.length; i++) {
        let watchedSet = global.watchedSetcodes[i];
        Log(`Watched set: ${JSON.stringify(watchedSet)}`);
        Log(`Start looking for new cards in set ${watchedSet.setCode} for channel ${watchedSet.channelID}`)
        let channel = global.bot.channels.cache.get(watchedSet.channelID) as TextChannel;
        if (channel) {
            let interval = startSpoilerWatch(
                channel,
                watchedSet.setCode
            );
            global.savedIntervals.push(new SavedInterval(watchedSet.setCode, channel.id, interval));
            getNewCardsCommand(channel, watchedSet.setCode);
        }
        else {
            Error('Something went wrong getting channel from saved watched setcodes file');
        }
    }
    return;
}
