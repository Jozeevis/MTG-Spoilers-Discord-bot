import https from 'https';

import { Log } from '../common/logging.js';
import { generateCardMessage } from '../card-helper.js';

/**
 * Tries to find card with the given name and post it to the given channel
 * Uses Scryfall fuzzy search
 */
export function getCard(channel, name) {
    // Make a request to the Scryfall api
    https.get(`https://api.scryfall.com/cards/named?fuzzy=${name}`, (resp) => {
        let data = '';

        // A chunk of data has been received.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received.
        resp.on('end', () => {
            let card = null;
            try {
                // Parse the data in the response
                card = JSON.parse(data);
            } catch (error) {
                Log('Something went wrong with parsing data from Scryfall.');
                Error(error);
                return;
            }
            if (card && card.object == 'card') {
                let message = generateCardMessage(card);
                channel.send(message);
            } else {
                if (card.object == 'error') {
                    if (card.type == 'ambiguous') {
                        channel.send(`Found multiple cards with name like ${name}. Please try to make a more specific query by adding more words.`);
                    } else {
                        channel.send(`Did not find any card with name like ${name}.`);
                    }
                }
            }
        });
    })
        .on('error', (err) => {
            Error(err.message);
            channel.send(`Error trying to get card with name like ${name}.\nCheck the console for more details.`);
        });
}
