import { interpolationGrid } from './components/interpolation_grid.ts'
import { interpolationKnotTable } from './components/interpolation_knot_table.ts'
import { DEFAULT_STATE, STAGE } from './constants.ts'
import { type IInterpolationState, type IInterpolator } from './types.ts'
import { rich } from '../../common/components/rich.ts'
import { spacer } from '../../common/components/spacer.ts'
import { GITHUB_PROJECT_CODE_URL } from '../../common/constants/url.ts'
import { createComponent as c } from '../../common/rendering/component.ts'
import { StateStore } from '../../common/support/state_store.ts'
import { type IWebsitePageState } from '../../common/types/page.ts'
import { playgroundMenu } from '../core/components/playground_menu.ts'
import { spotlightPage } from '../core/components/spotlight_page.ts'
import { type ClientWebsiteEnvironment } from '../core/environment.ts'
import { interpolationLegendTable } from './components/interpolation_legend_table.ts'
import { INTERPOLATORS } from './interpolation.ts'
import { type KnotMapping } from '../../common/math/numeric.ts'

export function indexPage(pageState: IWebsitePageState, env: ClientWebsiteEnvironment) {
  const _ = env.gettext.bindToBundle('univariate_interpolation')
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
      class: 'univariate-interpolation-page',
      stage: c.factory(interpolationGrid, { store }),
      menu: c.factory(
        playgroundMenu, undefined,
        c.html('button', {
          class: 'button-danger',
          text: _({ bundleId: 'univariate_interpolation', key: 'control.reset.label' }),
          click(_event: PointerEvent) {
            const message = _.plain('control.reset.confirmation')

            if (window.confirm(message)) {
              store.update({ knots: DEFAULT_STATE.knots })
            }
          },
        }),
      ),
    },
    c.factory(spacer, { dynamics: 'mf' }),
    c.factory(rich, {
      rootTag: 'section',
      doc: _.rich$(
        {
          key: 'text',
          context: {
            githubPageUrl: `${GITHUB_PROJECT_CODE_URL}/client/univariate_interpolation`,
            xMin: Math.ceil(STAGE.getLeftPos()),
            xMax: Math.floor(STAGE.getRightPos()),
            yMin: Math.ceil(STAGE.getTopPos()),
            yMax: Math.floor(STAGE.getBottomPos()),
          },
        },
      ),
    }),
    c.html('h2', { text: _('knot_table.section_heading') }),
    c.factory(interpolationKnotTable, { knots: store.keyedObservables.knots }),
    c.factory(spacer, { dynamics: 'mf' }),
    c.html('h2', { text: _('legend_table.section_heading') }),
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
