import { Channel } from "discord.js";
import { Error } from "./logging";

/**
 * Sends the given message to the given channel if it's a sendable channel, otherwise log error and return false
 */
export function TrySend(channel: Channel, message: string) {
    if (channel.isSendable()) {
        return channel.send(message);
    }
    Error(`Attempted to send message to channel ${channel.id}, but the channel was not sendable. Message: ${message}`);
    return false;
}