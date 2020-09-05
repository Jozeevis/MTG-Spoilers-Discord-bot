import { dirname } from "path";
import { fileURLToPath } from 'url';

var appDir = dirname(fileURLToPath(import.meta.url));

const DATADIRECTORY = `${appDir}/data`;
const SETTINGSPATH = `${DATADIRECTORY}/settings.json`;
const WATCHEDSETCODESPATH = `${DATADIRECTORY}/watchedsetcodes.json`;
const BASICLANDNAMES = ["plains", "island", "swamp", "mountain", "forest"];

export default {
    BOTDEFAULTPREFIX: "!",
    BOTNECESSARYPERMISSION: "MANAGE_MESSAGES",
    SPOILERWATCHINTERVALTIME: 1000 * 60 * 10, // in milliseconds, so 1000 * 60 * 30 = every 10 minutes
    DATADIRECTORY,
    SETTINGSPATH,
    WATCHEDSETCODESPATH,
    BASICLANDNAMES
};
