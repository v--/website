import { stringifyNumber } from './floating.ts'
import { getObjectEntries, intersperse } from './iteration.ts'
import { type uint32 } from '../types/numbers.ts'

export const BASE_INDENTATION = 2

export function join(iterable: Iterable<string>, delimiter: string, lastDelimiter: string = delimiter): string {
  return intersperse(iterable, delimiter, lastDelimiter)
    .reduce((accum, value) => accum + value, '')
}

export function snakeToPascalCase(string: string): string {
  return string.split('_').map(s => s[0].toUpperCase() + s.slice(1)).join('')
}

export function snakeToKebabCase(string: string): string {
  return string.replaceAll('_', '-')
}

export interface RecursiveStringifierConfig {
  indentation?: uint32
  prefix: string
  suffix: string
  iterChildren(largeIndentation?: uint32): Iterable<string>
}

export function recursivelyStringify(config: RecursiveStringifierConfig): string {
  if (config.indentation === undefined) {
    return config.prefix +
      join(config.iterChildren(), ', ') +
      config.suffix
  }

  const smallIndent = ' '.repeat(config.indentation)
  const largeIndent = ' '.repeat(config.indentation + BASE_INDENTATION)
  const guts = join(config.iterChildren(config.indentation + BASE_INDENTATION), ',\n' + largeIndent)

  return config.prefix +
    (guts ? '\n' + largeIndent : '') +
    guts +
    (guts ? '\n' + smallIndent : '') +
    config.suffix
}

export type QuoteType = 'single' | 'double' | 'ticks'

function reprImpl(value: unknown, quoteType: QuoteType, indentation?: uint32): string {
  if (typeof value === 'number') {
    return String(stringifyNumber(value))
  }

  if (typeof value === 'string') {
    switch (quoteType) {
      case 'single':
        return "'" + value.replace(/'/g, "\\'") + "'"
      case 'double':
        return '"' + value.replace(/"/g, '\\"') + '"'
      case 'ticks':
        return '`' + value.replace(/`/g, '\\`') + '`'
    }
  }

  if (value instanceof Function) {
    return value.name || 'anonymous'
  }

  if (value instanceof Array) {
    return recursivelyStringify({
      prefix: '[',
      suffix: ']',
      indentation,
      * iterChildren(largeIndentation?: uint32) {
        for (const item of value) {
          yield reprImpl(item, quoteType, largeIndentation)
        }
      },
    })
  }

  if (value instanceof Object && (!('toString' in value) || value.toString === Object.prototype.toString)) {
    const hasBraceSpacing = indentation === undefined && Object.keys(value).length > 0

    const string = recursivelyStringify({
      prefix: hasBraceSpacing ? '{ ' : '{',
      suffix: hasBraceSpacing ? ' }' : '}',
      indentation,
      * iterChildren(largeIndentation?: uint32) {
        for (const [k, v] of getObjectEntries(value)) {
          yield `${k}: ${reprImpl(v, quoteType, largeIndentation)}`
        }
      },
    })

    if (value.constructor === Object) {
      return string
    }

    return `${repr(value.constructor)} ${string}`
  }

  return String(value)
}

export interface IReprParams {
  indent?: boolean
  quoteType?: QuoteType
}

export function repr(value: unknown, params?: IReprParams): string {
  return reprImpl(
    value,
    params?.quoteType ?? 'single',
    params?.indent === true ? 0 : undefined,
  )
}

export function quoteString(value: string, quoteType?: QuoteType): string {
  return repr(value, { quoteType })
}
