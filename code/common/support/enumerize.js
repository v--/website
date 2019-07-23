export default function enumerize (...values) {
  const result = Object.create(null)

  for (const value of values) {
    result[value] = Symbol(value)
  }

  return Object.freeze(result)
}
