import { zip, map, range, product } from '../../../common/support/iteration.mjs'
import { join } from '../../../common/support/strings.mjs'
import { s } from '../../../common/support/svg.mjs'

export default function curveCanvas ({ width, height, mapping, curves, fittersShown }) {
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
  const visibleCurves = curves.filter(c => fittersShown.get(c.fitter))

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
      ...visibleCurves.map(function ({ curve, fitter, color }) {
        return s(
          'polyline',
          { class: 'curve', stroke: color, points: join(' ', zip(domain, domain.map(x => curve.evaluate(x)))) }
        )
      })
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
