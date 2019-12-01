export function mapToObject (map) {
  const result = Object.create(null)

  for (const [key, value] of map.entries()) {
    result[key] = value
  }

  return result
}
