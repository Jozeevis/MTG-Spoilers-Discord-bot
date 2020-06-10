const getAllCards = require('./commands/getAllCards');
const startWatch = require('./commands/startWatch');
const stopWatch = require('./commands/stopWatch');
const clear = require('./commands/clear');

module.exports = {
    getAllCards: getAllCards.getAllCards,
    startWatch: startWatch.startWatch,
    stopWatch: stopWatch.stopWatch,
    clear: clear.clear
};
  