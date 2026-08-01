import fs from 'fs';
import constants from '../constants';
import path from 'node:path';
import { Collection } from 'discord.js';

export function findCommands() {
    let commands = new Collection();
    const commandFiles = fs.readdirSync(constants.COMMANDSDIRECTYORY).filter((file) => file.endsWith('.js'));
    console.log(commandFiles);

    for (const file of commandFiles) {
        const filePath = path.join(constants.COMMANDSDIRECTYORY, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }

    return commands;
}