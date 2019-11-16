import { isSameNumber } from '../../../../common/support/numeric.js'

import { Matrix, MatrixDimensionError } from './matrix.js'
import { frobNorm } from './norm.js'

export function findMatrixMax (matrix) {
  let maxI = 0
  let maxJ = 0
  let max = 0

  for (let i = 0; i < matrix.rows; i++) {
    for (let j = 0; j < matrix.cols; j++) {
      const newMax = Math.abs(matrix.get(i, j))

      if (newMax > max) {
        max = newMax
        maxI = i
        maxJ = j
      }
    }
  }

  return {
    i: maxI,
    j: maxJ
  }
}

export function givensRotation (n, i, j, phi) {
  const matrix = Matrix.unit(n)
  matrix.set(i, i, Math.cos(phi))
  matrix.set(i, j, -Math.sin(phi))
  matrix.set(j, i, Math.sin(phi))
  matrix.set(j, j, Math.cos(phi))
  return matrix
}

export function jacobiMethod (matrix, maxIter = 1000) {
  if (matrix.rows !== matrix.cols) {
    throw new MatrixDimensionError('Can only find eigenvalues for square matrices')
  }

  const n = matrix.rows

  let d = matrix.clone()
  let l = Matrix.unit(n)
  let err = Number.POSITIVE_INFINITY

  for (let k = 0; k < maxIter; k++) {
    const b = d.sub(Matrix.diagonal(d.getDiagonal()))
    const { i, j } = findMatrixMax(b)
    err = frobNorm(b)

    if (isSameNumber(err, 0)) {
      break
    }

    const phi = Math.atan2(2 * d.get(i, j), d.get(i, i) - d.get(j, j)) / 2
    const u = givensRotation(n, i, j, phi)

    d = u.transpose().mult(d).mult(u)
    l = l.mult(u)
  }

  return { d, l }
}

export function eigen (matrix) {
  const n = matrix.rows
  const pairs = []
  const { l, d } = jacobiMethod(matrix)
  const cols = l.toCols()

  for (let j = 0; j < n; j++) {
    pairs.push({
      oldIndex: j,
      value: d.get(j, j),
      array: cols[j]
    })
  }

  const sorted = pairs.sort((a, b) => b.value - a.value)

  return {
    d: Matrix.diagonal(sorted.map(p => p.value)),
    l: Matrix.fromCols(sorted.map(p => p.array))
  }
}
