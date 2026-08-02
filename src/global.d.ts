import Discord from 'discord.js';
import { IWatchedSetcode, ISavedInterval } from './models';

declare global {
    var bot: Discord.Client;
    var commands: Discord.Collection;
    var savedIntervals: ISavedInterval[];
    var watchedSetcodes: IWatchedSetcode[];
    var prefix: string;
    var showReprints: boolean;
}