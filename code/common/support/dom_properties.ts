import { getObjectEntries } from './iteration.ts'
import { type ExtendedNullable } from '../types/typecons.ts'

export function classlist(...classes: Array<ExtendedNullable<string>>) {
  return classes.filter(Boolean).join(' ') || undefined
}

export function styles(record: Record<string, string>) {
  return getObjectEntries(record).map(([key, value]) => `${key}: ${value}`).join('; ')
}
