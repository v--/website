const moment = require('moment');
const colors = require('colors/safe');

module.exports = class Logger {
    constructor(name) {
        this.name = name;
    }

    log(level, message, dest=process.stdout) {
        const dateString = moment().format('YYYY-MM-DD hh:mm:ss.SSS');
        dest.write(`${dateString} ${colors.bold(level)} [${this.name}] ${message}\n`);
    }

    debug(message) {
        this.log('DEBUG', colors.green(message), process.stdout);
    }

    info(message) {
        this.log('INFO', message, process.stdout);
    }

    warn(message) {
        this.log('WARN', colors.yellow(message), process.stderr);
    }
};
