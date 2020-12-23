export function mapToObject<T extends string | number | symbol, S>(map: Map<T, S>): Record<T, S> {
  const result = Object.create(null)

  for (const [key, value] of map.entries()) {
    result[key] = value
  }

  return result
}
