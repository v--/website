import { Motif, MotifColor } from './motif.js'

/**
 * @param {Motif} motif
 * @param {TNum.UInt32} iStart
 * @param {TNum.UInt32} iEnd
 * @param {TNum.UInt32} jStart
 * @param {TNum.UInt32} jEnd
 * @param {MotifColor} color
 */
export function drawRectangle(motif, iStart, iEnd, jStart, jEnd, color) {
  for (let i = iStart; i < iEnd; i++) {
    for (let j = jStart; j < jEnd; j++) {
      motif.setSingleColor(i, j, color)
    }
  }
}

/**
 * @param {Motif} motif
 * @param {TNum.UInt32} start
 * @param {TNum.UInt32} end
 * @param {MotifColor} color
 */
export function drawTransverseLine(motif, start, end, color) {
  for (let t = start; t <= end; t++) {
    for (let j = 0; j < t; j++) {
      if (j < motif.side && t - j < motif.side) {
        motif.setSingleColor(j, t - j, color)
      }
    }
  }
}

/**
 * @param {Motif} motif
 * @param {TNum.UInt32} iCenter
 * @param {TNum.UInt32} jCenter
 * @param {TNum.UInt32} radius
 * @param {TNum.UInt32} thickness
 * @param {MotifColor} color
 */
export function drawDiamond(motif, iCenter, jCenter, radius, thickness, color) {
  for (let t = 0; t < thickness; t++) {
    for (let j = 0; j < radius - t; j++) {
      motif.setSingleColor(iCenter - radius + j + t, jCenter + j, color)
    }

    for (let j = 0; j < radius - t; j++) {
      motif.setSingleColor(iCenter + radius - j - t - 2, jCenter + j, color)
    }
  }
}

/**
 * @param {TNum.UInt32} seed
 * @param {TNum.UInt32} side
 * @returns {Motif}
 */
export function motifGenerator(seed, side = 20) {
  const motif = new Motif({ seed, side })

  drawTransverseLine(motif, 0, 3, 'g')
  drawTransverseLine(motif, 5, 7 + (seed % 3 > 0 ? 1 : 0), 'r')

  const diamondCenter = 15 + seed % 2
  drawDiamond(motif, diamondCenter, 0, 5 - seed % 3, 3, 'r')
  drawDiamond(motif, diamondCenter, 0, 3, 2, 'g')

  for (let k = 0; k < 1 + seed % 2; k++) {
    drawRectangle(motif, 10 + 3 * k, 13 + 3 * k, 8 + 2 * k, 10 + 2 * k, 'g')
  }

  drawRectangle(motif, 8 - seed % 2, 13 + seed % 5, 6, 7, 'r')
  drawTransverseLine(motif, 27 + seed % 2, 29 + seed % 2, 'r')
  drawDiamond(motif, 16, 16, 4, 3, 'g')

  return motif
}
