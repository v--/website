import { uint32 } from '../../types/numeric.js'
import { Matrix } from './matrix.js'

export function lNorm(matrix: Matrix, p: uint32, q: uint32) {
  let result = 0

  for (let j = 0; j < matrix.cols; j++) {
    let col = 0

    for (let i = 0; i < matrix.rows; i++) {
      col += Math.abs(matrix.get(i, j)) ** p
    }

    result += col ** (q / p)
  }

  return result ** (1 / q)
}

export function frobNorm(matrix: Matrix) {
  return lNorm(matrix, 2, 2)
}
