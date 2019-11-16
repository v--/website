import { Matrix, MatrixDimensionError } from './matrix.js'

function swapRowsInline (matrix, a, b) {
  for (let j = 0; j < matrix.cols; j++) {
    const tmp = matrix.get(a, j)
    matrix.setInline(a, j, matrix.get(b, j))
    matrix.setInline(b, j, tmp)
  }
}

export function lu (matrix) {
  if (matrix.rows !== matrix.cols) {
    throw new MatrixDimensionError('Can only decompose square matrices')
  }

  const n = matrix.rows

  const p = Matrix.unit(n)
  const l = Matrix.zero(n)
  const u = matrix.dup()

  for (let j = 0; j < n; j++) {
    let max = 0
    let maxRow = j

    for (let i = j + 1; i < n; i++) {
      const newMax = Math.abs(u.get(i, j))

      if (newMax > max) {
        max = newMax
        maxRow = i
      }
    }

    if (maxRow !== j) {
      swapRowsInline(u, j, maxRow)
      swapRowsInline(l, j, maxRow)
      swapRowsInline(p, j, maxRow)
    }

    for (let i = j + 1; i < n; i++) {
      const pivot = u.get(i, j) / u.get(j, j)

      for (let k = j + 1; k < n; k++) {
        u.setInline(i, k, u.get(i, k) - u.get(j, k) * pivot)
      }

      u.setInline(i, j, 0)
      l.setInline(i, j, pivot)
    }
  }

  for (let i = 0; i < n; i++) {
    l.setInline(i, i, 1)
  }

  return { p, l, u }
}
