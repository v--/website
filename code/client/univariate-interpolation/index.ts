import { interpolationGrid } from './components/interpolation-grid.ts'
import { interpolationKnotTable } from './components/interpolation-knot-table.ts'
import { DEFAULT_STATE, STAGE } from './constants.ts'
import { type IInterpolationState, type IInterpolator } from './types.ts'
import { button } from '../../common/components/button.ts'
import { rich } from '../../common/components/rich.ts'
import { spacer } from '../../common/components/spacer.ts'
import { GITHUB_PROJECT_CODE_URL } from '../../common/constants/url.ts'
import { createComponent as c } from '../../common/rendering/component.ts'
import { StateStore } from '../../common/support/state-store.ts'
import { type IWebsitePageState } from '../../common/types/page.ts'
import { spotlightPage } from '../core/components/spotlight-page.ts'
import { type ClientWebsiteEnvironment } from '../core/environment.ts'
import { interpolationLegendTable } from './components/interpolation-legend-table.ts'
import { INTERPOLATORS } from './interpolation.ts'
import { type KnotMapping } from '../../common/math/numeric.ts'
import { closeDrawer } from '../core/components/playground-menu.ts'

export function indexPage(pageState: IWebsitePageState, env: ClientWebsiteEnvironment) {
  const _ = env.gettext.bindToBundle('univariate-interpolation')
  const store = new StateStore<IInterpolationState>(DEFAULT_STATE, env.pageUnload$)

  store.keyedObservables.knots.subscribe({
    next(knots: KnotMapping) {
      store.update({
        interpolated: INTERPOLATORS.map(function (interpolator: IInterpolator) {
          return {
            interpolator,
            fun: interpolator.interpolate(knots),
          }
        }),
      })
    },
  })

  return c.factory(spotlightPage,
    {
      rootClass: 'univariate-interpolation-page',
      stage: () => c.factory(interpolationGrid, { store }),
      submenu: () => c.html('menu', { class: 'playground-submenu' },
        c.html('li', { class: 'playground-submenu-item' },
          c.factory(button, {
            text: _({ bundleId: 'univariate-interpolation', key: 'control.reset.label' }),
            buttonStyle: 'danger',
            click(_event: PointerEvent) {
              const message = _.plain('control.reset.confirmation')

              if (window.confirm(message)) {
                store.update({ knots: DEFAULT_STATE.knots })
                closeDrawer()
              }
            },
          }),
        ),
      ),
    },
    c.factory(spacer, { dynamics: 'mf' }),
    c.factory(rich, {
      rootTag: 'section',
      doc: _.rich$(
        {
          key: 'text',
          context: {
            githubPageUrl: `${GITHUB_PROJECT_CODE_URL}/client/univariate-interpolation`,
            xMin: Math.ceil(STAGE.getLeftPos()),
            xMax: Math.floor(STAGE.getRightPos()),
            yMin: Math.ceil(STAGE.getTopPos()),
            yMax: Math.floor(STAGE.getBottomPos()),
          },
        },
      ),
    }),
    c.html('h2', { text: _('knot-table.section-heading') }),
    c.factory(interpolationKnotTable, { knots: store.keyedObservables.knots }),
    c.factory(spacer, { dynamics: 'mf' }),
    c.html('h2', { text: _('legend-table.section-heading') }),
    c.factory(interpolationLegendTable, {
      interpolated: store.keyedObservables.interpolated,
      visible: store.keyedObservables.visible,
      toggleVisibility(interpolator: IInterpolator, newValue: boolean) {
        const visible = store.getState('visible')
        const newVisible = {
          ...visible,
          [interpolator.id]: newValue,
        }

        store.update({ visible: newVisible })
      },
    }),
  )
}
