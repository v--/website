/**
 * @template T extends string | number | symbol
 * @template S
 * @param {Map<T, S>} map
 * @returns {Record<T, S>}
 */
export function mapToObject(map) {
  const result = Object.create(null)

  for (const [key, value] of map.entries()) {
    result[key] = value
  }

  return result
}
