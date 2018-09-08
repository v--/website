import { filter, map } from './iteration.mjs'
import { join } from './strings.mjs'

export function classlist (...classes) {
  return join(' ', filter(Boolean, classes))
}

export function styles (object) {
  return join('; ', map(([key, value]) => `${key}: ${value}`, Object.entries(object)))
}
