import { c } from '../../common/component'
import section from '../../common/components/section'
import aspectRatioBox from '../core/components/aspect_ratio_box'

import GridObservable from './support/grid_observable'
import curveCanvas from './components/curve_canvas'

const WIDTH = 20
const HEIGHT = 16

window.bundles.set('curve_fitting', function playgroundCurveFitting () {
  const observable = new GridObservable(WIDTH, HEIGHT)

  return c('div', { class: 'page playground-curve-fitting-page' },
    c(section, { title: '[WIP] Curve fitting visualizations' }),
    c(
      aspectRatioBox,
      {
        item: c(curveCanvas, observable),
        ratio: 5 / 4
      }
    )
  )
})
