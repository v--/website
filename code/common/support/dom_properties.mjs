import { filter, map } from './iteration'
import { join } from './strings'

export function classlist (...classes) {
  return join(' ', filter(Boolean, classes))
}

export function styles (object) {
  return join('; ', map(([key, value]) => `${key}: ${value}`, Object.entries(object)))
}
