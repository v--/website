import { type uint32 } from './types/numbers.ts'

export const LOGGER_LEVELS = ['DEBUG', 'INFO', 'WARN', 'ERROR'] as const
export type LoggerLevel = typeof LOGGER_LEVELS[uint32]

const MAX_LOG_LEVEL_LENGTH = Math.max(...LOGGER_LEVELS.map(level => level.length))

export function formatLoggerLevel(level: LoggerLevel) {
  return level.padEnd(MAX_LOG_LEVEL_LENGTH)
}

function padDateValue(value: uint32) {
  return String(value).padStart(2, '0')
}

interface IFormatDateOptions {
  includeDate?: boolean
}

export function formatDate(date: Date, { includeDate }: IFormatDateOptions = {}) {
  // TODO@2030: Update this when Temporal is widely available
  // Date#toISOString() is close to what we need but it doesn't respect time zones

  let result = ''

  if (includeDate) {
    const Y = date.getFullYear()
    const m = padDateValue(date.getMonth() + 1)
    const d = padDateValue(date.getDate())
    result += `${Y}-${m}-${d}`
  }

  if (result.length > 0) {
    result += ' '
  }

  const h = padDateValue(date.getHours())
  const M = padDateValue(date.getMinutes())
  const s = padDateValue(date.getSeconds())
  result += `${h}:${M}:${s}`

  return result
}

export abstract class Logger {
  readonly subject: string
  readonly level: LoggerLevel
  #levelIndex: uint32

  constructor(subject: string, level: LoggerLevel) {
    this.subject = subject
    this.level = level
    this.#levelIndex = LOGGER_LEVELS.indexOf(level)
  }

  abstract write(level: LoggerLevel, ...contents: unknown[]): void

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
