import { ChatInputCommandInteraction, GuildTextBasedChannel, MessageFlags, SlashCommandBuilder, TextBasedChannel, TextChannel } from 'discord.js';

import constants from '../constants';
import { SavedInterval, WatchedSetCode } from '../../models/';
import { getNewCardsCommand } from '../commands';
import { Log } from '../common/logging';
import { saveWatchedSets } from '../common/io';
import { startSpoilerWatch } from '../common/spoilerWatches';
import { TrySend } from '../common/discord';

/**
 * Starts spoilerwatch for set with the given setcode in the given channel
 */
export function startWatchCommand(channel: GuildTextBasedChannel | TextBasedChannel, set: string) {
    //Add the combination to the watched sets and save this
    global.watchedSetcodes.push(new WatchedSetCode(set, channel.id));
    saveWatchedSets();
    Log(`Starting spoilerwatch for set ${set}.`);
    TrySend(channel, `Starting spoilerwatch for set ${set}.`);

    //Immediately look for new cards
    Log(`Start looking for new cards on ${Date.now()}`);
    getNewCardsCommand(channel, set);
    //Start the interval to look for new cards
    let interval = startSpoilerWatch(channel, set);
    global.savedIntervals.push(new SavedInterval(set, channel.id, interval));
}

const setcodeOptionName = 'setcode';

export const data = new SlashCommandBuilder()
    .setName('watch')
    .setDescription('Start watching the given set, which will automatically send new cards for that set.')
    .addStringOption((option) => 
        option.setName(setcodeOptionName)
        .setDescription('The set code for the set to be watched')
        .setRequired(true)
        .setMaxLength(constants.SETCODEMAXLENGTH)
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const setCode = interaction.options.getString(setcodeOptionName);
    if (setCode === null) {
        await interaction.reply({ content: 'You need to enter the set code to watch', flags: MessageFlags.Ephemeral });
        return;
    }
    const channel = await global.bot.channels.fetch(interaction.channelId);
    if (channel === null) {
        await interaction.reply({ content: 'Something went wrong saving the channel to send cards in', flags: MessageFlags.Ephemeral });
        return;
    }
    //Add the combination to the watched sets and save this
    global.watchedSetcodes.push(new WatchedSetCode(setCode as string, interaction.channelId));
    saveWatchedSets();
    Log(`Starting spoilerwatch for set ${setCode}.`);
    await interaction.reply({content: `Starting spoilerwatch for set ${setCode}.`, flags: MessageFlags.Ephemeral });

    //Immediately look for new cards
    Log(`Start looking for new cards on ${Date.now()}`);
    getNewCardsCommand(channel as TextChannel, setCode as string);
    //Start the interval to look for new cards
    let interval = startSpoilerWatch(channel as TextChannel, setCode);
    global.savedIntervals.push(new SavedInterval(setCode as string, interaction.channelId, interval));
};