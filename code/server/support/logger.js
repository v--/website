export class Logger {
  /**
   * @param {string} name
   */
  constructor(name) {
    this.name = name
  }

  /**
   * @param {string} level
   * @param {string} message
   * @param {NodeJS.WriteStream} dest
   */
  // eslint-disable-next-line no-undef
  log(level, message, dest = process.stdout) {
    dest.write(`${level} [${this.name}] ${message}\n`)
  }

  /** @param {string} message */
  debug(message) {
    this.log('DEBUG', message, process.stdout)
  }

  /** @param {string} message */
  info(message) {
    this.log('INFO', message, process.stdout)
  }

  /** @param {string} message */
  warn(message) {
    this.log('WARN', message, process.stderr)
  }
}
