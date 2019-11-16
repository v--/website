export function enumerate (...values) {
  const result = Object.create(null)

  for (const value of values) {
    result[value] = Symbol(value)
  }

  return Object.freeze(result)
}
