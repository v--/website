import { Motif, MotifColor } from './motif.js'

export function drawRectangle(motif: Motif, iStart: uint32, iEnd: uint32, jStart: uint32, jEnd: uint32, color: MotifColor): void {
  for (let i = iStart; i < iEnd; i++) {
    for (let j = jStart; j < jEnd; j++) {
      motif.setSingleColor(i, j, color)
    }
  }
}

export function drawTransverseLine(motif: Motif, start: uint32, end: uint32, color: MotifColor): void {
  for (let t = start; t <= end; t++) {
    for (let j = 0; j < t; j++) {
      if (j < motif.side && t - j < motif.side) {
        motif.setSingleColor(j, t - j, color)
      }
    }
  }
}

export function drawDiamond(motif: Motif, iCenter: uint32, jCenter: uint32, radius: uint32, thickness: uint32, color: MotifColor): void {
  for (let t = 0; t < thickness; t++) {
    for (let j = 0; j < radius - t; j++) {
      motif.setSingleColor(iCenter - radius + j + t, jCenter + j, color)
    }

    for (let j = 0; j < radius - t; j++) {
      motif.setSingleColor(iCenter + radius - j - t - 2, jCenter + j, color)
    }
  }
}

export function motifGenerator(seed: uint32, side: uint32 = 20): Motif {
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
