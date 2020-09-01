module.exports = {
  // Returns the data filename for the given set and channelID
  getFilename: function (set, channelID) {
    return `./data/${channelID}-${set}-data.json`;
  },
};
