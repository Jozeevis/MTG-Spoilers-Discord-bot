/**
 * Logs the given message to the console with a human readable date prefixed
 */
export function Log(message) {
    console.log(`${getReadableDate()} - ${message}`);
}

/**
 * Logs the given message to the console as an error with a human readable date prefixed
 */
export function Error(message) {
    console.error(`${getReadableDate()} - ERROR: ${message}`);
}

/**
 * Returns the current date in a readable format
 */
function getReadableDate() {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1; //January is 0!
    let h = today.getHours();
    let m = today.getMinutes();

    let yyyy = today.getFullYear();
    if (dd < 10) {
        dd = `0${dd}`;
    }
    if (mm < 10) {
        mm = `0${mm}`;
    }
    if (h < 10) {
        h = `0${h}`;
    }
    if (m < 10) {
        m = `0${m}`;
    }
    let dateString = `[${dd}/${mm}/${yyyy} ${h}:${m}]`;
    return dateString;
}
