import fs from 'fs';

import constants from '../constants';

/**
 * Logs the given message to the console with a human readable date prefixed
 */
export function Log(message: string) {
    let log = `${getReadableDate()} - ${message}`
    console.log(log);
    writeToLogFile(log);
}

/**
 * Logs the given message to the console as an error with a human readable date prefixed
 */
export function Error(message: any) {
    let log = `${getReadableDate()} - ERROR: ${message as string}`
    console.error(log);
    writeToLogFile(log);
}

/**
 * Write the log to the log file on disk
 */
function writeToLogFile(log: string) {
    if (!fs.existsSync(constants.DATADIRECTORY)) {
        fs.mkdirSync(constants.DATADIRECTORY);
    }
    if (!fs.existsSync(constants.LOGPATH)) {
        fs.writeFile(
            constants.LOGPATH,
            log + '\n',
            function (err) {
                if (err) {
                    console.error("Something went wrong with creating new log file: " + err.message);
                }
            }
        );
    } else {
        fs.appendFile(
            constants.LOGPATH,
            log + '\n',
            function (err) {
                if (err) {
                    console.error("Something went wrong with appending to log file: " + err.message);
                }
            }
        );
    }
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
