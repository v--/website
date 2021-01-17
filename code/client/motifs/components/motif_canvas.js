import { s } from '../../../common/support/svg.js'
import { map, range, product } from '../../../common/support/iteration.js'

import { Motif } from '../motif.js'

const SQUARE_VISUAL_PADDING = 0.01
const SQUARE_VISUAL_SIZE_STRING = String(1 - 2 * SQUARE_VISUAL_PADDING)

/**
 * @param {{ motif: Motif }} arg0
 */
export function motifCanvas({ motif }) {
  const side = motif.side
  const viewBox = [-side + 1, -side + 1, 2 * side - 1, 2 * side - 1].join(' ')

  return s(
    'svg',
    {
      class: 'motif',
      viewBox: viewBox
    },

    s(
      'g',
      { class: 'blocks' },
      ...map(
        function([i, j, rotation]) {
          const pointAngle = Math.atan2(i, j) + rotation
          const pointRadius = Math.sqrt(i ** 2 + j ** 2)
          const fill = i > j ? motif.getColorString(i, j) : motif.getColorString(j, i)

          if (fill === 'rgb(256, 256, 256)') {
            return null
          }

          return s('rect', {
            fill,
            width: SQUARE_VISUAL_SIZE_STRING,
            height: SQUARE_VISUAL_SIZE_STRING,
            x: String(pointRadius * Math.cos(pointAngle) + SQUARE_VISUAL_PADDING),
            y: String(pointRadius * Math.sin(pointAngle) + SQUARE_VISUAL_PADDING)
          })
        },
        /** @type {Iterable<[Num.UInt32, Num.UInt32, Num.Float64]>} */ (
          product(
            range(0, side),
            range(1, side),
            [0, Math.PI / 2, Math.PI, 3 / 2 * Math.PI]
          )
        )
      ),
      s('rect', {
        fill: motif.getColorString(0, 0),
        width: SQUARE_VISUAL_SIZE_STRING,
        height: SQUARE_VISUAL_SIZE_STRING,
        x: String(SQUARE_VISUAL_PADDING),
        y: String(SQUARE_VISUAL_PADDING)
      })
    )
  )
}
