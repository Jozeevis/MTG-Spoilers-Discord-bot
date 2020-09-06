import { Snowflake } from "discord.js";

/**
 * Returns the data filename for the given set and channelID
 */
export function getFilename(set: string, channelID: Snowflake) {
    return `./data/${channelID}-${set}-data.json`;
}
