const fs = require('fs');

const logging = require('../common/logging');
const IO = require('../common/io');

module.exports = {
    clear: function(channel, set) {
        let fileName = IO.getFilename(set, channel.id);
        try {
            fs.writeFile(fileName, "[]", (err) => {
                if (err) {
                    logging.Log('Something went wrong with clearing file ' + fileName)
                    logging.Log('ERROR: ' + err);
                    return;
                }
                logging.Log("Successfully cleared file " + fileName + ".");
            });
            channel.send("Successfully cleared file for set with code " + set + ".");
        }
        catch(error) {
            channel.send("Something went wrong with clearing file for set with code " + set + ".");
            logging.Log("Something went wrong with clearing file for set with code " + set + ".");
            logging.Log('ERROR: ' + error);
        }
    }
}