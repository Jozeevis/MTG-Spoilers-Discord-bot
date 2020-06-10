const getAllCards = require("./commands/getAllCards");
const getNewCards = require("./commands/getNewCards");
const startWatch = require("./commands/startWatch");
const stopWatch = require("./commands/stopWatch");
const clear = require("./commands/clear");
const prefixCommand = require("./commands/prefix");

module.exports = {
  getAllCards: getAllCards.getAllCards,
  getNewCards: getNewCards.getNewCards,
  startWatch: startWatch.startWatch,
  stopWatch: stopWatch.stopWatch,
  clear: clear.clear,
  prefix: prefixCommand.prefixCommand,
};
