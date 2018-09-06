import { zip, map, range, product } from '../../../common/support/iteration'
import { join } from '../../../common/support/strings'
import { s } from '../../../common/support/svg'
import { classlist } from '../../../common/support/dom_properties'

import fitters from '../fitters'

function generateSVGLine (fitter, mapping, domain) {
  let range

  if (mapping.domain.size > 0) {
    const curve = fitter.fit(x => mapping.get(x), Array.from(mapping.domain))
    range = domain.map(x => curve.evaluate(x))
  } else {
    range = domain.map(x => 0)
  }

  return s(
    'polyline',
    { class: classlist('curve', fitter.cssClass), points: join(' ', zip(domain, range)) }
  )
}

export default function curveCanvas ({ width, height, mapping }) {
  const grid = Array.from(
    map(
      ([x, y]) => ({ x, y }),
      product(
        range(-width / 2, width / 2 + 1),
        range(-height / 2, height / 2 + 1)
      )
    )
  )

  const viewBox = [
    -(width + 1) / 2,
    -(height + 1) / 2,
    width + 1,
    height + 1
  ]

  const domain = Array.from(range(-(width + 1) / 2, (width + 1) / 2, 0.1))

  return s(
    'svg',
    {
      class: 'curve-canvas',
      viewBox: viewBox.join(' ')
    },

    s(
      'g',
      { class: 'point-grid' },
      ...grid.map(function (point) {
        return s('circle', {
          class: 'grid-point',
          r: '0.1',
          cx: String(point.x),
          cy: String(point.y)
        })
      })
    ),

    s(
      'g',
      { class: 'hover-grid' },
      ...grid.map(function (point) {
        return s('rect', {
          class: 'grid-square',
          x: String(point.x - 0.5),
          y: String(point.y - 0.5),
          width: String(1),
          height: String(1),
          click (e) {
            if (mapping.get(point.x) !== point.y) {
              mapping.set(point.x, point.y)
            } else {
              mapping.delete(point.x)
            }
          }
        })
      })
    ),

    s(
      'g',
      { class: 'curves' },
      ...fitters.map(fitter => generateSVGLine(fitter, mapping, domain))
    ),

    s(
      'g',
      { class: 'active-points' },
      ...Array.from(mapping.domain).map(function (x) {
        return s('circle', {
          class: 'grid-point',
          r: '0.25',
          cx: String(x),
          cy: String(mapping.get(x))
        })
      })
    )
  )
}
