const logging = require("../common/logging");
const cardHelper = require("../card-helper");

module.exports = {
  // Finds all cards in the given set that and post them to the given channel
  getCard: function (channel, name) {
    // Make a request to the Scryfall api
    const https = require("https");
    https
      .get(
        `https://api.scryfall.com/cards/named?fuzzy=${name}`,
        (resp) => {
          let data = "";

          // A chunk of data has been received.
          resp.on("data", (chunk) => {
            data += chunk;
          });

          // The whole response has been received.
          resp.on("end", () => {
            let card = null;
            try {
              // Parse the data in the response
              card = JSON.parse(data);
            } catch (error) {
              logging.Log("Something went wrong with parsing data from Scryfall.");
              logging.Error(error);
              return;
            }
            if (
              card &&
              card.object == "card"
            ) {
                let message = cardHelper.generateCardMessage(card);
                channel.send(message);
            } else {
              channel.send(`Did not find any card with name like ${name}.`);
            }
          });
        }
      )
      .on("error", (err) => {
        logging.Error(err.message);
        channel.send(`Error trying to get card with name like ${name}.\nCheck the console for more details.`);
      });
  },
};
