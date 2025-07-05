import { type uint32 } from './types/numbers.ts'

const LOGGER_LEVELS = ['DEBUG', 'INFO', 'WARN', 'ERROR'] as const
export type LoggerLevel = typeof LOGGER_LEVELS[uint32]

function padDateValue(value: uint32) {
  return String(value).padStart(2, '0')
}

export abstract class Logger {
  readonly name: string
  readonly level: LoggerLevel
  #levelIndex: uint32

  constructor(name: string, level: LoggerLevel) {
    this.name = name
    this.level = level
    this.#levelIndex = LOGGER_LEVELS.indexOf(level)
  }

  abstract write(level: LoggerLevel, ...contents: unknown[]): void

  generatePrefix() {
    // TODO: Update this when Temporal is widely available
    // Date#toISOString() is close to what we need but it doesn't respect time zones
    const date = new Date()
    const Y = date.getFullYear()
    const m = padDateValue(date.getMonth() + 1)
    const d = padDateValue(date.getDate())
    const h = padDateValue(date.getHours())
    const M = padDateValue(date.getMinutes())
    const s = padDateValue(date.getSeconds())
    const dateString = `${Y}-${m}-${d} ${h}:${M}:${s}`

    return `${dateString} [${this.name}]`
  }

  log(level: LoggerLevel, ...contents: unknown[]) {
    if (LOGGER_LEVELS.indexOf(level) >= this.#levelIndex) {
      this.write(level, ...contents)
    }
  }

  debug(...contents: unknown[]) {
    this.log('DEBUG', ...contents)
  }

  info(...contents: unknown[]) {
    this.log('INFO', ...contents)
  }

  warn(...contents: unknown[]) {
    this.log('WARN', ...contents)
  }

  error(...contents: unknown[]) {
    this.log('ERROR', ...contents)
  }
}
