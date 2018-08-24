import { zip, range, product } from '../../../common/support/iteration'
import { join } from '../../../common/support/strings'
import { classlist } from '../../../common/support/dom_properties'
import { s } from '../../../common/support/svg'

import polynomialInterpolation from '../fitting/polynomial_interpolation'

export default function curveCanvas ({ width, height, data }) {
  const grid = Array.from(
    product(
      range(-width / 2, width / 2 + 1),
      range(-height / 2, height / 2 + 1)
    )
  )

  const viewBox = [
    -(width + 1) / 2,
    -(height + 1) / 2,
    width + 1,
    height + 1
  ]

  const dataLookup = new Set(data.map(point => point.join(',')))
  const f = x => data.find(d => d[0] === x)[1]
  const polynomial = polynomialInterpolation(f, data.map(d => d[0]))
  const x = Array.from(range(-(width + 1) / 2, (width + 1) / 2, 0.1))
  const y = x.map(x_ => polynomial.evaluate(x_))

  return s(
    'svg',
    {
      class: 'curve-canvas',
      viewBox: viewBox.join(' ')
    },

    s(
      'g',
      { class: 'point-grid' },
      ...grid.map(point => s('circle', {
        class: classlist('grid-point', dataLookup.has(point.join(',')) && 'active'),
        r: '0.1',
        cx: String(point[0]),
        cy: String(point[1])
      }))
    ),

    s(
      'polyline',
      { class: 'largange-polynomial', points: join(' ', zip(x, y)) }
    )
  )
}
