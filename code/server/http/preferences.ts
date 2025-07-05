const DEFAULT_MAP = new Map()

export function parsePreferenceHeader(headers?: string | string[]): Map<string, string> {
  if (headers === undefined) {
    return DEFAULT_MAP
  }

  const result = new Map()

  for (const header of (headers instanceof Array ? headers : [headers])) {
    for (const chunk of header.split(',')) {
      const [key, value] = chunk.split('=')
      result.set(key.trim(), value.trim())
    }
  }

  return result
}
