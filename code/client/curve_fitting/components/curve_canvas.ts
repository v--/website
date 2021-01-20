import { zip2, map, range, product2 } from '../../../common/support/iteration.js'
import { join } from '../../../common/support/strings.js'
import { s } from '../../../common/support/svg.js'
import { getMappingDomain } from '../support/mapping.js'
import { CurveFittingState } from '../types/state.js'

export function curveCanvas({ width, height, mapping, curves, fitters, updateMapping, deleteMapping }: CurveFittingState) {
  const grid = Array.from(
    map(
      ([x, y]) => ({ x, y }),
      product2(
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

  const domain: TNum.Float64[] = Array.from(range(-(width + 1) / 2, (width + 1) / 2, 0.1))
  const visibleCurves = curves.filter(c => fitters.has(c.fitter))

  return s(
    'svg',
    {
      class: 'curve-canvas',
      viewBox: viewBox.join(' ')
    },

    s(
      'g',
      { class: 'point-grid' },
      ...grid.map(function(point) {
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
      ...grid.map(function(point) {
        return s('rect', {
          class: 'grid-square',
          x: String(point.x - 0.5),
          y: String(point.y - 0.5),
          width: String(1),
          height: String(1),
          click(_event: MouseEvent) {
            if (mapping.get(point.x) !== point.y) {
              updateMapping(point.x, point.y)
            } else {
              deleteMapping(point.x)
            }
          }
        })
      })
    ),

    s(
      'g',
      { class: 'curves' },
      ...visibleCurves.map(function({ curve, cssClass }) {
        return s(
          'polyline',
          {
            class: 'curve ' + cssClass,
            points: join(
              ' ',
              map(
                ([x, y]) => `${x},${y}`,
                zip2(domain, domain.map(x => curve.eval(x)))
              )
            )
          }
        )
      })
    ),

    s(
      'g',
      { class: 'active-points' },
      ...getMappingDomain(mapping).map(function(x) {
        return s('circle', {
          class: 'grid-point',
          r: '0.25',
          cx: String(x),
          cy: String(mapping.get(x)!)
        })
      })
    )
  )
}
