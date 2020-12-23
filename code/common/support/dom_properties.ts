import { filter, map } from './iteration.js'
import { join } from './strings.js'

export function classlist(...classes: Array<string | boolean | null | undefined>): string {
  return join(' ', filter(Boolean, classes) as Iterable<string>)
}

export function styles(object: Record<string, string>) {
  return join('; ', map(([key, value]) => `${key}: ${value}`, Object.entries(object)))
}
