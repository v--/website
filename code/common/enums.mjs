export function enumerize (...values) {
  const result = Object.create(null)

  for (const value of values) {
    result[value] = Symbol(value)
  }

  return Object.freeze(result)
}

export const SidebarID = enumerize(
  'HOME',
  'FILES',
  'PACMAN',
  'PLAYGROUND',
  'ERROR'
)

export const PageUpdateMode = enumerize(
  'NORMAL',
  'TRUST_UNDERCOOKED_URL'
)
