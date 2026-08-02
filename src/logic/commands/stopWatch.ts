import { ChatInputCommandInteraction, GuildTextBasedChannel, MessageFlags, SlashCommandBuilder, TextBasedChannel } from 'discord.js';

import constants from '../constants';
import { Log } from '../common/logging';
import { saveWatchedSets } from '../common/io';
import { TrySend } from '../common/discord';

/**
 * Stops any current spoilerwatch for set with the given setcode in the given channel
 */
export function stopWatchCommand(channel: GuildTextBasedChannel | TextBasedChannel, set: string) {
    Log(`Checking spoilerwatch for set ${set}.`);
    Log(`Checking if set matches with ${set} and channel matches with ${channel.id}`);
    // Check if set is watched in the current channel
    if (
        global.watchedSetcodes &&
        global.watchedSetcodes.filter(function (watchedset) {
            watchedset.setCode == set && watchedset.channelID == channel.id;
        }).length
    ) {
        Log(`Stopping spoilerwatch for set ${set}.`);
        TrySend(channel, `Stopping spoilerwatch for set ${set}.`);
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
        TrySend(channel, `No spoilerwatch for set ${set} is running in this channel.`);
    }
}


const setcodeOptionName = 'setcode';

export const data = new SlashCommandBuilder()
    .setName('unwatch')
    .setDescription('Stop watching the given set, and no longer automatically send new cards for that set.')
    .addStringOption((option) => 
        option.setName(setcodeOptionName)
        .setDescription('The set code for the set to be unwatched')
        .setRequired(true)
        .setMaxLength(constants.SETCODEMAXLENGTH)
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const setCode = interaction.options.getString(setcodeOptionName);
    if (setCode === null) {
        await interaction.reply({ content: 'You need to enter the set code to watch', flags: MessageFlags.Ephemeral });
        return;
    }
    Log(`Checking spoilerwatch for set ${setCode}.`);
    Log(`Checking if set matches with ${setCode} and channel matches with ${interaction.channelId}`);
    // Check if set is watched in the current channel
    if (
        global.watchedSetcodes &&
        global.watchedSetcodes.filter(function (watchedset) {
            watchedset.setCode == setCode && watchedset.channelID == interaction.channelId;
        }).length
    ) {
        Log(`Stopping spoilerwatch for set ${setCode}.`);
        interaction.reply({ content: `Stopping spoilerwatch for set ${setCode}.`, flags: MessageFlags.Ephemeral });
        // Find the timeout for this set and channel
        global.savedIntervals.find((o, i) => {
            if (o.setcode == setCode && o.channel == interaction.channelId) {
                // Stop the interval that checks for spoilers
                clearInterval(o.interval);
                global.savedIntervals.splice(i, 1);
                return true;
            }
            return false;
        });
        // Remove the set and channel combination from the watchedSetcodes and save it
        global.watchedSetcodes = global.watchedSetcodes.filter(function (watchedset) {
            watchedset.setCode != setCode || watchedset.channelID != interaction.channelId;
        });
        saveWatchedSets();
    } else {
        interaction.reply({ content: `No spoilerwatch for set ${setCode} is running in this channel.`, flags: MessageFlags.Ephemeral });
    }
};