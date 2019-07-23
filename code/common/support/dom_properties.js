import { filter, map } from './iteration.js'
import { join } from './strings.js'

export function classlist (...classes) {
  return join(' ', filter(Boolean, classes))
}

export function styles (object) {
  return join('; ', map(([key, value]) => `${key}: ${value}`, Object.entries(object)))
}
