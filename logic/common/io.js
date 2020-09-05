/**
 * Returns the data filename for the given set and channelID
 */
export function getFilename(set, channelID) {
    return `./data/${channelID}-${set}-data.json`;
}
