export default class Logger {
  constructor (name) {
    this.name = name
  }

  log (level, message, dest = process.stdout) {
    dest.write(`${level} [${this.name}] ${message}\n`)
  }

  debug (message) {
    this.log('DEBUG', message, process.stdout)
  }

  info (message) {
    this.log('INFO', message, process.stdout)
  }

  warn (message) {
    this.log('WARN', message, process.stderr)
  }
}
