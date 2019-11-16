export function lNorm (matrix, p, q) {
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

export function frobNorm (matrix) {
  return lNorm(matrix, 2, 2)
}
