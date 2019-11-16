import { join, repr } from '../../support/strings.js'
import { map, repeat, zip, all, reduce } from '../../support/iteration.js'
import { isSameNumber } from '../../math/numeric/floating.js'

import { MathError } from '../errors.js'

export class MatrixError extends MathError {}
export class MatrixDimensionError extends MatrixError {}
export class MatrixIndexError extends MatrixError {}

function * iterToString (matrix) {
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

function dotProduct (u, v) {
  return reduce(([x, y], accum) => accum + x * y, zip(u, v), 0)
}

export class Matrix {
  static zero (rows, cols = rows) {
    return new this(rows, cols, Array.from(repeat(0, rows * cols)))
  }

  static unit (n) {
    const result = this.zero(n, n)

    for (let i = 0; i < n; i++) {
      result.set(i, i, 1)
    }

    return result
  }

  static diagonal (items) {
    const n = items.length
    const result = this.zero(n, n)

    for (let i = 0; i < n; i++) {
      result.set(i, i, items[i])
    }

    return result
  }

  static fromRows (rows) {
    if (rows.length === 0) {
      throw new MatrixDimensionError('At least one row is required')
    }

    const m = rows.length
    const n = rows[0].length

    const payload = []

    for (const row of rows) {
      if (row.length !== n) {
        throw new MatrixDimensionError('All rows must have the same size')
      }

      payload.push(...row)
    }

    return new this(m, n, payload)
  }

  static fromCols (cols) {
    if (cols.length === 0) {
      throw new MatrixDimensionError('At least one row is required')
    }

    return this.fromRows(cols).transpose()
  }

  static row (array) {
    return new this(1, array.length, array)
  }

  static col (array) {
    return new this(array.length, 1, array)
  }

  constructor (rows, cols, payload = []) {
    this.rows = rows
    this.cols = cols
    this.payload = payload
  }

  get (i, j) {
    if (i < 0 || i >= this.rows || j < 0 || j >= this.cols) {
      throw new MatrixIndexError(`Invalid indices ${i} and ${j} for ${repr(this)}`)
    }

    return this.payload[i * this.cols + j]
  }

  set (i, j, value) {
    if (i < 0 || i >= this.rows || j < 0 || j >= this.cols) {
      throw new MatrixIndexError(`Invalid indices ${i} and ${j} for ${repr(this)}`)
    }

    this.payload[i * this.cols + j] = value
  }

  clone () {
    return new this.constructor(
      this.rows,
      this.cols,
      this.payload.slice()
    )
  }

  transpose () {
    const result = new this.constructor(
      this.cols,
      this.rows,
      this.payload.slice()
    )

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result.set(j, i, this.get(i, j))
      }
    }

    return result
  }

  equals (other) {
    return this.cols === other.cols &&
      this.rows === other.rows &&
      all(([a, b]) => isSameNumber(a, b), zip(this.payload, other.payload))
  }

  add (other) {
    if (this.cols !== other.cols || this.rows !== other.rows) {
      throw new MatrixDimensionError('Incompatible matrix dimensions')
    }

    return new this.constructor(
      this.rows,
      this.cols,
      Array.from(map(([x, y]) => x + y, zip(this.payload, other.payload)))
    )
  }

  scale (scalar) {
    return new this.constructor(
      this.rows,
      this.cols,
      this.payload.map(v => scalar * v)
    )
  }

  sub (other) {
    return this.add(other.scale(-1))
  }

  mult (other) {
    if (this.cols !== other.rows) {
      throw new MatrixDimensionError('Incomparible matrix dimensions')
    }

    const rows = this.toRows()
    const cols = other.transpose().toRows()
    const result = this.constructor.zero(this.rows, other.cols)

    for (let i = 0; i < rows.length; i++) {
      for (let j = 0; j < cols.length; j++) {
        result.set(i, j, dotProduct(rows[i], cols[j]))
      }
    }

    return result
  }

  toRows () {
    const rows = []

    for (let i = 0; i < this.rows; i++) {
      rows.push(this.payload.slice(i * this.cols, (i + 1) * this.cols))
    }

    return rows
  }

  toCols () {
    return this.transpose().toRows()
  }

  getRow (i) {
    if (i < 0 || i >= this.rows) {
      throw new MatrixIndexError(`Invalid row ${i} for ${repr(this)}`)
    }

    return Matrix.row(this.payload.slice(i * this.cols, (i + 1) * this.cols))
  }

  getCol (j) {
    if (j < 0 || j >= this.cols) {
      throw new MatrixIndexError(`Invalid row ${j} for ${repr(this)}`)
    }

    const payload = []

    for (let i = 0; i < this.rows; i++) {
      payload.push(this.get(i, j))
    }

    return Matrix.col(payload)
  }

  delete (row, col) {
    const result = this.constructor.zero(this.rows - 1, this.cols - 1)

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

  getDiagonal () {
    const result = []

    for (let k = 0; k < Math.min(this.cols, this.rows); k++) {
      result.push(this.get(k, k))
    }

    return result
  }

  toString () {
    return join('', iterToString(this))
  }
}
