import { Matrix } from '../../common/math/linalg/matrix.js'

/**
 * @typedef {'r' | 'g' | 'b'} MotifColor
 */

/** @type {MotifColor[]} */
export const motifColor = ['r', 'g', 'b']

/**
 * @typedef {object} MotifParams
 * @property {TNum.UInt32} seed
 * @property {TNum.UInt32} side
 * @property {Matrix} [r]
 * @property {Matrix} [g]
 * @property {Matrix} [b]
 */

/**
 * @implements Required<MotifParams>
 */
export class Motif {
  /**
   * @param {MotifParams} params
   */
  constructor({ seed, side, r, g, b }) {
    this.seed = seed
    this.side = side
    this.r = r || Matrix.fill(1, this.side)
    this.g = g || Matrix.fill(1, this.side)
    this.b = b || Matrix.fill(1, this.side)
  }

  /**
   * @param {TNum.UInt32} i
   * @param {TNum.UInt32} j
   * @param {MotifColor} color
   * @param {TNum.UnitRatio} value
   */
  setSingleColor(i, j, color, value = 0.5) {
    for (const c of motifColor) {
      if (c === color) {
        this[c].set(i, j, value)
      } else {
        this[c].set(i, j, 0)
      }
    }
  }

  /**
   * @param {TNum.UInt32} i
   * @param {TNum.UInt32} j
   */
  getColorString(i, j) {
    return `rgb(${
      this.r.get(i, j) * 256
    }, ${
      this.g.get(i, j) * 256
    }, ${
      this.b.get(i, j) * 256
    })`
  }
}
