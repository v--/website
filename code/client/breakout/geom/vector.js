export function dotProduct (u, v) {
  return u.x * v.x + u.y * v.y
}

export function norm (v) {
  return Math.sqrt(dotProduct(v, v))
}

export function dist (u, v) {
  return Math.sqrt((v.x - u.x) ** 2 + (v.y - u.y) ** 2)
}

export function add (u, v) {
  return { x: u.x + v.x, y: u.y + v.y }
}

export function sub (u, v) {
  return { x: u.x - v.x, y: u.y - v.y }
}

export function scale (u, scalar) {
  return { x: scalar * u.x, y: scalar * u.y }
}

export function normalize (v) {
  return scale(v, 1 / norm(v))
}
