import { c } from '../../common/component'
import section from '../../common/components/section'
import aspectRatioBox from '../core/components/aspect_ratio_box'

import CurveObservable from './support/curve_observable'
import curveCanvas from './components/curve_canvas'

window.bundles.set('curve_fitting', function playgroundCurveFitting () {
  const observable = new CurveObservable({
    width: 20,
    height: 16,
    data: [[-8, 0], [-3, 3], [3, -4], [8, 4]]
  })

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
