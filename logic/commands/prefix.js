const dataIO = require("../data-io");

/* global prefix:writable */

module.exports = {
  prefixCommand: function (channel, newPrefix) {
    let oldPrefix = prefix;
    dataIO.writePrefix(newPrefix);
    prefix = newPrefix;
    channel.send("Changed prefix from " + oldPrefix + " to " + newPrefix + ".");
  },
};
