import { type KnotMapping } from '../../../common/math/numeric.ts'
import { createComponent as c } from '../../../common/rendering/component.ts'
import { type ClientWebsiteEnvironment } from '../../core/environment.ts'

interface IInterpolationKnotTableState {
  knots: KnotMapping
}

export function interpolationKnotTable({ knots }: IInterpolationKnotTableState, env: ClientWebsiteEnvironment) {
  const _ = env.gettext.bindToBundle('univariate_interpolation')

  return c.html('div', { class: 'interpolation-knots-table-wrapper' },
    c.html('table', { class: 'interpolation-knots-table delimited-table' },
      c.html('tr', { class: 'interpolation-knots-table-x-row' },
        c.html('th', { text: 'x' }),
        // TODO: Remove Array.from once Iterator.prototype.map() proliferates
        ...Array.from(knots.iterX()).map(
          x => c.html('td', { text: String(x) }),
          knots.iterX(),
        ),
        knots.isEmpty() && c.html('td', {
          class: 'interpolation-knots-table-placeholder-cell',
          text: _('knot_table.placeholder'),
        }),
      ),
      c.html('tr', { class: 'interpolation-knots-table-y-row' },
        c.html('th', { text: 'y' }),
        // TODO: Remove Array.from once Iterator.prototype.map() proliferates
        ...Array.from(knots.iterY()).map(
          y => c.html('td', { text: String(y) }),
          knots.iterY(),
        ),
        knots.isEmpty() && c.html('td', {
          class: 'interpolation-knots-table-placeholder-cell',
          text: _('knot_table.placeholder'),
        }),
      ),
    ),
  )
}
