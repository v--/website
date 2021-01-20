import { Matrix } from '../../common/math/linalg/matrix.js'

export const motifColor = ['r', 'g', 'b'] as const
export type MotifColor = typeof motifColor[number]

export interface MotifParams {
  seed: TNum.UInt32
  side: TNum.UInt32
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

  setSingleColor(i: TNum.UInt32, j: TNum.UInt32, color: MotifColor, value: TNum.UnitRatio = 0.5) {
    for (const c of motifColor) {
      if (c === color) {
        this[c].set(i, j, value)
      } else {
        this[c].set(i, j, 0)
      }
    }
  }

  getColorString(i: TNum.UInt32, j: TNum.UInt32) {
    return `rgb(${
      this.r.get(i, j) * 256
    }, ${
      this.g.get(i, j) * 256
    }, ${
      this.b.get(i, j) * 256
    })`
  }
}
