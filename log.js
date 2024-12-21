const fs = require("fs");

function logToFile(message) {
    const logMessage = `${new Date().toISOString()} - ${message}\n`;
    fs.appendFileSync("app.log", logMessage);
}


module.exports = logToFile;