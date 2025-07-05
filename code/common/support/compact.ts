import { getObjectEntries } from './iteration.ts'

export function compact<T extends object>(record: T): Required<T> {
  const result: Partial<T> = {}

  for (const [key, value] of getObjectEntries(record)) {
    if (value !== undefined) {
      result[key] = value
    }
  }

  return result as Required<T>
}
