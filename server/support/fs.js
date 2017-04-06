const fs = require('fs');

const { promisory } = require('common/support/async');

module.exports = {
    stat: promisory(fs.stat),

    createReadStream: fs.createReadStream,
    createWriteStream: fs.createWriteStream
};
