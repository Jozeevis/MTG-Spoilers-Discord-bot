const logging = require("../common/logging");
const cardHelper = require("../card-helper");
const { BASICLANDNAMES } = require("../constants");

module.exports = {
  // Finds all cards in the given set that and post them to the given channel
  getAllCards: function (channel, set, ignoreBasics = true) {
      ignoreBasics = ignoreBasics != 'false';
      let message = `Trying to get cards from set with code ${set}`;
      if (ignoreBasics != false) {
          message += " (excluding basic lands)";
      }
    channel.send(`${message}...`);

    // Make a request to the Scryfall api
    const https = require("https");
    https
      .get(
        `https://api.scryfall.com/cards/search?order=spoiled&q=e%3A${set}&unique=prints`,
        (resp) => {
          let data = "";

          // A chunk of data has been received.
          resp.on("data", (chunk) => {
            data += chunk;
          });

          // The whole response has been received.
          resp.on("end", () => {
            let cardlist = null;
            try {
              // Parse the data in the response
              cardlist = JSON.parse(data);
            } catch (error) {
              logging.Log("Something went wrong with parsing data from Scryfall.");
              logging.Error(error);
              return;
            }
            if (
              cardlist &&
              cardlist.object == "list"
            ) {
              // Log any warnings in the API response
              if (cardlist.warnings) {
                  logging.Log(cardlist.warnings);
              }

              if (ignoreBasics) {
                  logging.Log("Ignoring basic lands");
                cardlist.data = cardlist.data.filter((card) => {
                    return !BASICLANDNAMES.includes(card.name.toLowerCase());
                });
              }

              // If new list is empty, no new cards were found
              if (cardlist.total_cards <= 0) {
                logging.Log(`No cards were found with set code ${set}`);
                channel.send(`No cards were found with set code ${set}.`);
              } else {
                // If new list wasn't empty, send one of the new cards to the channel every second
                logging.Log(`${cardlist.total_cards} cards were found with set code ${set}`);
                let interval = setInterval(
                  function (cards) {
                    if (cards.length <= 0) {
                      logging.Log("Done with sending cards to channel.");
                      clearInterval(interval);
                    } else {
                        let card = cards.pop();
                        let message = cardHelper.generateCardMessage(card);
                        channel.send(message);
                    }
                  },
                  1000,
                  cardlist.data
                );
              }
            } else {
              channel.send(`Did not find any card with set code ${set}.`);
            }
          });
        }
      )
      .on("error", (err) => {
        logging.Error(err.message);
        channel.send(`Error trying to get cards with set code ${set}.\nCheck the console for more details.`);
      });
  },
};
