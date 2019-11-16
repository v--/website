import { isSameNumber, roundNumber } from '../../../../common/support/numeric.js'

import { Matrix, MatrixDimensionError } from './matrix.js'
import { frobNorm } from './norm.js'

export function householderReflection (column, k) {
  const n = column.rows
  const u = Matrix.zero(n, 1)

  for (let i = k; i < n; i++) {
    u.set(i, 0, column.get(i, 0))
  }

  const pivot = column.get(k, 0)
  u.set(k, 0, pivot + Math.sign(pivot) * frobNorm(u))

  const v = u.scale(Math.sqrt(2) / frobNorm(u))
  const h = Matrix.unit(n)

  for (let i = k; i < n; i++) {
    for (let j = k; j < n; j++) {
      const value = (i === j) - v.get(i, 0) * v.get(j, 0)
      h.set(i, j, value)
    }
  }

  return h
}

export function qr (matrix) {
  if (matrix.rows !== matrix.cols) {
    throw new MatrixDimensionError('Can only decompose square matrices')
  }

  const n = matrix.rows
  let r = matrix
  let q = Matrix.unit(n)

  for (let k = 0; k < n; k++) {
    const h = householderReflection(r.getCol(k), k)
    r = h.mult(r)
    q = q.mult(h.transpose())
  }

  return { q, r }
}

export function det (matrix) {
  const { r } = qr(matrix)
  let result = -1

  for (let i = 0; i < r.rows; i++) {
    result *= r.get(i, i)
  }

  return result
}

export function eigenvalues (matrix, iterations = 50) {
  if (matrix.rows !== matrix.cols) {
    throw new MatrixDimensionError('Can only find eigenvalues for square matrices')
  }

  const u = Matrix.unit(matrix.rows)
  let a = matrix

  for (let k = 0; k < iterations; k++) {
    const { q, r } = qr(a)
    a = r.mult(q)
  }

  const eigenvalues = new Set()

  for (const c of a.getDiagonal()) {
    const d = det(matrix.sub(u.scale(c)))

    if (isSameNumber(d, 0)) {
      eigenvalues.add(roundNumber(c))
    }
  }

  return eigenvalues
}
