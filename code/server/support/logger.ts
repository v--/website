export class Logger {
  constructor(
    public name: string
  ) {}

  log(level: string, message: string, dest: NodeJS.WriteStream = process.stdout) {
    dest.write(`${level} [${this.name}] ${message}\n`)
  }

  debug(message: string) {
    this.log('DEBUG', message, process.stdout)
  }

  info(message: string) {
    this.log('INFO', message, process.stdout)
  }

  warn(message: string) {
    this.log('WARN', message, process.stderr)
  }
}
