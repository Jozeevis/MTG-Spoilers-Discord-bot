const constants = require("../constants");

module.exports = {
  checkPermissions: function (message) {
    if (!message.member.hasPermission(constants.BOTNECESSARYPERMISSION)) {
      message.channel.send("You do not have permissions to use that command.");
      return false;
    }
    return true;
  },
};
