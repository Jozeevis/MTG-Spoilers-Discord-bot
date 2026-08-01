import { REST, Routes } from 'discord.js';
import  fs from 'node:fs';
import path from 'node:path';
import constants from '../constants';
import auth from '../../auth.json';
import { Log, Error } from '../common/logging';

const commands = [];
const commandFiles = fs.readdirSync(constants.COMMANDSDIRECTYORY).filter((file: string) => file.endsWith('.js') && !file.includes('index.js'));

for (const file of commandFiles) {
    const filePath = path.join(constants.COMMANDSDIRECTYORY, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
		commands.push(command.data.toJSON());
    } else {
        Log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

const rest = new REST().setToken(auth.token);

(async () => {
	try {
		Log(`Started refreshing ${commands.length} application (/) commands.`);

		const data = await rest.put(Routes.applicationCommands(auth.clientId), { body: commands });

		Log(`Successfully reloaded ${(data as unknown[]).length} application (/) commands.`);
	} catch (error) {
		Error(error);
	}
})();