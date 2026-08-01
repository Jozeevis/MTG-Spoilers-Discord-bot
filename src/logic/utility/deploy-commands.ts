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
		Log(`Started refreshing ${commands.length} slash commands.`);

		let data;
		if ('guildId' in auth) {
			await rest.put(Routes.applicationCommands(auth.clientId), { body: [] });
			data = await rest.put(Routes.applicationGuildCommands(auth.clientId, auth.guildId as string), { body: commands });
			Log(`Successfully reloaded ${(data as unknown[]).length} slash commands for server with id ${auth.guildId}.`);
		}
		else {
			data = await rest.put(Routes.applicationCommands(auth.clientId), { body: commands });
			// Use the following line to clear any server registered commands if you want to use global ones instead (replace GUILD-ID with your server id)
			// await rest.put(Routes.applicationGuildCommands(auth.clientId, 'GUILD-ID'), { body: [] });
			Log(`Successfully reloaded ${(data as unknown[]).length} application slash commands.`);
		}
	} catch (error) {
		Error(error);
	}
})();