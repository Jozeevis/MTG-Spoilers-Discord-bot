import path from "path";

var appDir = path.resolve('./');

const DATADIRECTORY = `${appDir}/data`;
const SETTINGSPATH = `${DATADIRECTORY}/settings.json`;
const WATCHEDSETCODESPATH = `${DATADIRECTORY}/watchedsetcodes.json`;

const MESSAGEINTERVAL = 1500;
const APICALLINTERVAL = 500;
const BASICLANDNAMES = ["plains", "island", "swamp", "mountain", "forest"];

export default {
    BOTDEFAULTPREFIX: "!",
    BOTNECESSARYPERMISSION: "MANAGE_MESSAGES",
    SPOILERWATCHINTERVALTIME: 1000 * 60 * 10, // in milliseconds, so 1000 * 60 * 30 = every 10 minutes
    DATADIRECTORY,
    SETTINGSPATH,
    WATCHEDSETCODESPATH,
    MESSAGEINTERVAL,
    APICALLINTERVAL,
    BASICLANDNAMES,
};
