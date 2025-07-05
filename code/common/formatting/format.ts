import { MissingFieldError } from './errors.ts'
import { parseFormattingTemplate } from './parser.ts'
import { type IFormattingTemplate } from './types.ts'
import { repr } from '../support/strings.ts'

export function formatTemplate(template: IFormattingTemplate, values: Record<string, string>) {
  return template.entries.map(function (entry) {
    if (typeof entry === 'string') {
      return entry
    }

    if (!(entry.field in values)) {
      throw new MissingFieldError(`Missing value for field specifier ${repr(entry.field)}`)
    }

    return values[entry.field]
  }).join('')
}

export function format(template: string, values: Record<string, string>) {
  return formatTemplate(parseFormattingTemplate(template), values)
}
