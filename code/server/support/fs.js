const fs = require('fs');

const { promisory } = require('server/support/async');

module.exports = {
    stat: promisory(fs.stat),
    readFile: promisory(fs.readFile),

    createReadStream: fs.createReadStream,
    createWriteStream: fs.createWriteStream
};
