import { Matrix } from '../../common/math/linalg/matrix.js'

export const motifColor = ['r', 'g', 'b'] as const
export type MotifColor = typeof motifColor[number]

export interface MotifParams {
  seed: Num.UInt32
  side: Num.UInt32
  r?: Matrix
  g?: Matrix
  b?: Matrix
}

export interface Motif extends Required<MotifParams> {}
export class Motif {
  constructor(params: MotifParams) {
    Object.assign(this, params)

    for (const color of motifColor) {
      if (!params[color]) {
        this[color] = Matrix.fill(1, this.side)
      }
    }
  }

  setSingleColor(i: Num.UInt32, j: Num.UInt32, color: MotifColor, value: Num.UnitRatio = 0.5) {
    for (const c of motifColor) {
      if (c === color) {
        this[c].set(i, j, value)
      } else {
        this[c].set(i, j, 0)
      }
    }
  }

  getColorString(i: Num.UInt32, j: Num.UInt32) {
    return `rgb(${
      this.r.get(i, j) * 256
    }, ${
      this.g.get(i, j) * 256
    }, ${
      this.b.get(i, j) * 256
    })`
  }
}
