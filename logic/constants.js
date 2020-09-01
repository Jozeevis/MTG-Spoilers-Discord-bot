var path = require("path");
var appDir = path.dirname(require.main.filename);

const DATADIRECTORY = appDir + "/data";
const SETTINGSPATH = DATADIRECTORY + "/settings.json";
const WATCHEDSETCODESPATH = DATADIRECTORY + "/watchedsetcodes.json";
const BASICLANDNAMES = ["plains", "island", "swamp", "mountain", "forest"];

module.exports = {
  BOTDEFAULTPREFIX: "!",
  BOTNECESSARYPERMISSION: "MANAGE_MESSAGES",
  SPOILERWATCHINTERVALTIME: 1000 * 60 * 30, // in milliseconds, so 1000 * 60 * 30 = every 30 minutes
  DATADIRECTORY,
  SETTINGSPATH,
  WATCHEDSETCODESPATH,
  BASICLANDNAMES
};
