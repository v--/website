import { type KnotMapping } from '../../../common/math/numeric.ts'
import { c } from '../../../common/rendering/component.ts'
import { type ClientWebsiteEnvironment } from '../../core/environment.ts'

interface IInterpolationKnotTableState {
  knots: KnotMapping
}

export function interpolationKnotTable({ knots }: IInterpolationKnotTableState, env: ClientWebsiteEnvironment) {
  const _ = env.gettext$

  return c('div', { class: 'interpolation-knots-table-wrapper' },
    c('table', { class: 'interpolation-knots-table delimited-table' },
      c('tr', { class: 'interpolation-knots-table-x-row' },
        c('th', { text: 'x' }),
        // TODO: Remove Array.from once Iterator.prototype.map() proliferates
        ...Array.from(knots.iterX()).map(
          x => c('td', { text: String(x) }),
          knots.iterX(),
        ),
        knots.isEmpty() && c('td', {
          class: 'interpolation-knots-table-placeholder-cell',
          text: _({ bundleId: 'univariate_interpolation', key: 'knot_table.placeholder' }),
        }),
      ),
      c('tr', { class: 'interpolation-knots-table-y-row' },
        c('th', { text: 'y' }),
        // TODO: Remove Array.from once Iterator.prototype.map() proliferates
        ...Array.from(knots.iterY()).map(
          y => c('td', { text: String(y) }),
          knots.iterY(),
        ),
        knots.isEmpty() && c('td', {
          class: 'interpolation-knots-table-placeholder-cell',
          text: _({ bundleId: 'univariate_interpolation', key: 'knot_table.placeholder' }),
        }),
      ),
    ),
  )
}
