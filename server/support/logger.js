import moment from 'moment';
import colors from 'colors/safe';


export default class Logger {
    constructor(name, verbose=false) {
        this.name = name;
        this.verbose = verbose;
    }

    log(level, message, dest=process.stdout) {
        const dateString = moment().format('YYYY-MM-DD hh:mm:ss.SSS');
        dest.write(`${dateString} ${colors.bold(level)} [${this.name}] ${message}\n`);
    }

    debug(message) {
        if (this.debug)
            this.log('DEBUG', colors.green(message), process.stdout);
    }

    info(message) {
        this.log('INFO', message, process.stdout);
    }

    warn(message) {
        this.log('WARN', colors.yellow(message), process.stderr);
    }

    fatal(message) {
        this.log('FATAL', colors.red(message), process.stderr);
        process.exit(1);
    }
}
