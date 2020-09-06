/**
 * Logs the given message to the console with a human readable date prefixed
 */
export function Log(message: string) {
    console.log(`${getReadableDate()} - ${message}`);
}

/**
 * Logs the given message to the console as an error with a human readable date prefixed
 */
export function Error(message: string) {
    console.error(`${getReadableDate()} - ERROR: ${message}`);
}

/**
 * Returns the current date in a readable format
 */
function getReadableDate() {
    let today = new Date();
    let date = today.getDate();
    let month = today.getMonth() + 1; //January is 0!
    let hour = today.getHours();
    let minute = today.getMinutes();
    let year = today.getFullYear();

    let dateString = date.toString();
    let monthString = month.toString();
    let hourString = hour.toString();
    let minuteString = minute.toString();

    if (date < 10) {
        dateString = `0${date}`;
    }
    if (month < 10) {
        monthString = `0${month}`;
    }
    if (hour < 10) {
        hourString = `0${hour}`;
    }
    if (minute < 10) {
        minuteString = `0${minute}`;
    }
    return `[${dateString}/${monthString}/${year} ${hourString}:${minuteString}]`;
}
