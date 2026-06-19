/* eslint-disable no-console */

import { Logger, type LoggerLevel, formatDate, formatLoggerLevel } from '../../common/logger.ts'
import { intersperse } from '../../common/support/iteration.ts'

export class ClientLogger extends Logger {
  write(level: LoggerLevel, ...contents: unknown[]) {
    const key = level.toLowerCase() as Lowercase<LoggerLevel>
    console[key](
      formatDate(new Date(), { includeDate: false }),
      formatLoggerLevel(level),
      `[${this.subject}]`,
      ...intersperse(contents, '\n'),
    )
  }
}
