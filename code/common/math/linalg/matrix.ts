import { join, repr } from '../../support/strings.js'
import { map, repeat, zip2, all, reduce } from '../../support/iteration.js'
import { isSameNumber } from '../../math/numeric/floating.js'

import { MathError } from '../errors.js'

export class MatrixError extends MathError {}
export class MatrixDimensionError extends MatrixError {}
export class MatrixIndexError extends MatrixError {}

function * iterToString(matrix: Matrix) {
  const rows = matrix.toRows()
  yield 'Matrix(['

  for (let i = 0; i < matrix.rows; i++) {
    yield '\n\t' + repr(rows[i])

    if (i < matrix.rows - 1) {
      yield ','
    }
  }

  yield '\n])'
}

function dotProduct(u: float64[], v: float64[]) {
  return reduce(([x, y], accum) => accum + x * y, zip2(u, v), 0)
}

export interface MatrixParams {
  rows: number
  cols: number
  payload: number[]
}

export interface Matrix extends MatrixParams {}
export class Matrix {
  static fill(fill: float64, rows: uint32, cols: uint32 = rows) {
    return new this({
      rows,
      cols,
      payload: Array.from(repeat(fill, rows * cols))
    })
  }

  static zero(rows: uint32, cols = rows) {
    return this.fill(0, rows, cols)
  }

  static unit(n: uint32) {
    const result = this.zero(n, n)

    for (let i = 0; i < n; i++) {
      result.set(i, i, 1)
    }

    return result
  }

  static diagonal(items: float64[]) {
    const n = items.length
    const result = this.zero(n, n)

    for (let i = 0; i < n; i++) {
      result.set(i, i, items[i])
    }

    return result
  }

  static fromRows(rows: float64[][]) {
    if (rows.length === 0) {
      throw new MatrixDimensionError('At least one row is required')
    }

    const n = rows.length
    const m = rows[0].length

    const payload = []

    for (const row of rows) {
      if (row.length !== m) {
        throw new MatrixDimensionError('All rows must have the same size')
      }

      payload.push(...row)
    }

    return new this({
      rows: n,
      cols: m,
      payload
    })
  }

  static fromCols(cols: float64[][]) {
    if (cols.length === 0) {
      throw new MatrixDimensionError('At least one row is required')
    }

    return this.fromRows(cols).transpose()
  }

  static row(array: float64[]) {
    return new this({
      payload: array,
      rows: 1,
      cols: array.length
    })
  }

  static col(array: float64[]) {
    return new this({
      payload: array,
      rows: array.length,
      cols: 1
    })
  }

  constructor(payload: MatrixParams) {
    Object.assign(this, payload)
  }

  get(i: uint32, j: uint32) {
    if (i < 0 || i >= this.rows || j < 0 || j >= this.cols) {
      throw new MatrixIndexError(`Invalid indices ${i} and ${j} for ${repr(this)}`)
    }

    return this.payload[i * this.cols + j]
  }

  set(i: uint32, j: uint32, value: float64) {
    if (i < 0 || i >= this.rows || j < 0 || j >= this.cols) {
      throw new MatrixIndexError(`Invalid indices ${i} and ${j} for ${repr(this)}`)
    }

    this.payload[i * this.cols + j] = value
  }

  clone() {
    return new Matrix({
      rows: this.rows,
      cols: this.cols,
      payload: this.payload.slice()
    })
  }

  transpose() {
    const result = new Matrix({
      rows: this.cols,
      cols: this.rows,
      payload: []
    })

    for (let j = 0; j < this.cols; j++) {
      for (let i = 0; i < this.rows; i++) {
        result.set(j, i, this.get(i, j))
      }
    }

    return result
  }

  equals(other: Matrix) {
    return this.cols === other.cols &&
      this.rows === other.rows &&
      all(([a, b]) => isSameNumber(a, b), zip2(this.payload, other.payload))
  }

  add(other: Matrix) {
    if (this.cols !== other.cols || this.rows !== other.rows) {
      throw new MatrixDimensionError('Incompatible matrix dimensions')
    }

    return new Matrix({
      rows: this.rows,
      cols: this.cols,
      payload: Array.from(map(([x, y]) => x + y, zip2(this.payload, other.payload)))
    })
  }

  scale(scalar: float64) {
    return new Matrix({
      rows: this.rows,
      cols: this.cols,
      payload: this.payload.map(v => scalar * v)
    })
  }

  sub(other: Matrix) {
    return this.add(other.scale(-1))
  }

  mult(other: Matrix) {
    if (this.cols !== other.rows) {
      throw new MatrixDimensionError('Incomparible matrix dimensions')
    }

    const rows = this.toRows()
    const cols = other.transpose().toRows()
    const result = Matrix.zero(this.rows, other.cols)

    for (let i = 0; i < rows.length; i++) {
      for (let j = 0; j < cols.length; j++) {
        result.set(i, j, dotProduct(rows[i], cols[j]))
      }
    }

    return result
  }

  toRows() {
    const rows = []

    for (let i = 0; i < this.rows; i++) {
      rows.push(this.payload.slice(i * this.cols, (i + 1) * this.cols))
    }

    return rows
  }

  toCols() {
    return this.transpose().toRows()
  }

  getRow(i: uint32) {
    if (i < 0 || i >= this.rows) {
      throw new MatrixIndexError(`Invalid row ${i} for ${repr(this)}`)
    }

    return Matrix.row(this.payload.slice(i * this.cols, (i + 1) * this.cols))
  }

  getCol(j: uint32) {
    if (j < 0 || j >= this.cols) {
      throw new MatrixIndexError(`Invalid row ${j} for ${repr(this)}`)
    }

    const payload = []

    for (let i = 0; i < this.rows; i++) {
      payload.push(this.get(i, j))
    }

    return Matrix.col(payload)
  }

  delete(row: uint32, col: uint32) {
    const result = Matrix.zero(this.rows - 1, this.cols - 1)

    for (let i = 0; i < this.rows; i++) {
      if (i === row) {
        continue
      }

      for (let j = 0; j < this.cols; j++) {
        if (j === col) {
          continue
        }

        const resultI = i > row ? (i - 1) : i
        const resultJ = j > col ? (j - 1) : j

        result.set(resultI, resultJ, this.get(i, j))
      }
    }

    return result
  }

  getDiagonal() {
    const result = []

    for (let k = 0; k < Math.min(this.cols, this.rows); k++) {
      result.push(this.get(k, k))
    }

    return result
  }

  toString() {
    return join('', iterToString(this))
  }
}
