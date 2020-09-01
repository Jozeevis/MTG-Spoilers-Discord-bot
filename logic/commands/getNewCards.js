const fs = require("fs");

const logging = require("../common/logging");
const IO = require("../common/io");
const cardHelper = require("../card-helper");

const { BASICLANDNAMES } = require("../constants");

module.exports = {
  // Finds all new cards in the given set that haven't been posted to the given channel yet and posts them there
  getNewCards: function (channel, set, verbose = false, ignoreBasics = true) {
    ignoreBasics = ignoreBasics != 'false';
    // Read which cards are already saved
    let fileName = IO.getFilename(set, channel.id);
    let savedCardlist = JSON.parse("[]");
    fs.exists(fileName, (exists) => {
      if (!exists) {
        // If data file doesn't exist yet, make an empty one
        fs.writeFile(fileName, "[]", (err) => {
          if (err) {
            logging.Log("Something went wrong with writing new data file.");
            logging.Log("ERROR: " + err);
          }
          logging.Log("Successfully written to file " + fileName + ".");
        });
      } else {
        // If data file does exist, try to read it
        try {
          fs.readFile(fileName, function (err, buf) {
            if (err) {
              logging.Log(
                "Something went wrong with reading existing saved file."
              );
              logging.Log("ERROR: " + err);
            }
            savedCardlist = JSON.parse(buf);
            logging.Log("Successfully read file " + fileName + ".");
          });
        } catch (error) {
          logging.Log(
            "Something went wrong with parsing data from existing saved file."
          );
          logging.Log("ERROR: " + error);
          return;
        }
      }

      if (verbose) {
        let message = "Trying to get newly spoiled cards from set with code " + set;
        if (ignoreBasics != false) {
            message += " (excluding basic lands)";
        }
        channel.send(message + "...");
      }

      // Make a request to the Scryfall api
      const https = require("https");
      https
        .get(
          "https://api.scryfall.com/cards/search?order=spoiled&q=e%3A" +
            set +
            "&unique=prints",
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
                logging.Log(
                  "Something went wrong with parsing data from Scryfall."
                );
                logging.Log("ERROR:" + error);
                return;
              }

              if (ignoreBasics) {
                  logging.Log("Ignoring basic lands");
                cardlist.data = cardlist.data.filter((card) => {
                    return !BASICLANDNAMES.includes(card.name.toLowerCase());
                });
              }

              let newCardlist = [];
              if (cardlist && cardlist.object == "list" && cardlist.total_cards > 0) {
                // For every card: check if it's already saved, otherwise at it to the new list
                cardlist.data.forEach(function (card) {
                  let cardId = card.oracle_id;

                  if (!savedCardlist.some((c) => c == cardId)) {
                    newCardlist.push(card);
                    savedCardlist.push(cardId);
                  }
                });

                // If new list is empty, no new cards were found
                if (newCardlist.length <= 0) {
                  logging.Log("No new cards were found with set code " + set);
                  if (verbose) {
                    channel.send(
                      "No new cards were found with set code " + set + "."
                    );
                  }
                } else {
                  // If new list wasn't empty, send one of the new cards to the channel every second
                  logging.Log(
                    newCardlist.length +
                      " new cards were found with set code " +
                      set
                  );
                  let interval = setInterval(
                    function (cards) {
                      if (cards.length <= 0) {
                        logging.Log("Done with sending cards to channel.");
                        clearInterval(interval);
                      } else {
                        // Get all relevant data from the card
                        let card = cards.pop();
                        let message = cardHelper.generateCardMessage(card);
                        channel.send(message);
                      }
                    },
                    1000,
                    newCardlist
                  );

                  try {
                    // Save the updated list of saved cards to the datafile
                    let savedCardlistJSON = JSON.stringify(savedCardlist);
                    fs.writeFile(fileName, savedCardlistJSON, function (err) {
                      if (err) {
                        logging.Log("Something went wrong with saving file.");
                        logging.Log("ERROR: " + err);
                      }
                      logging.Log("New card list has succesfully been saved!");
                    });
                  } catch (error) {
                    logging.Log("Something went wrong with saving new data.");
                    logging.Log("ERROR: " + error);
                    return;
                  }
                }
              } else {
                if (verbose) {
                  channel.send(
                    "Did not find any card with set code " + set + "."
                  );
                }
              }
            });
          }
        )
        .on("error", (err) => {
          logging.Log("Error: " + err.message);
          channel.send(
            "Error trying to get cards with set code " +
              set +
              ".\n" +
              "Check the console for more details."
          );
        });
    });
  },
};
