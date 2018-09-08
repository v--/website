import { c } from '../../common/rendering/component'
import section from '../../common/components/section'
import { aspectRatioRoot, aspectRatioBox } from '../core/components/aspect_ratio_box'

import GridObservable from './support/grid_observable'
import curveCanvas from './components/curve_canvas'
import curveLegend from './components/curve_legend'

const WIDTH = 20
const HEIGHT = 16

export default function playgroundCurveFitting () {
  const observable = new GridObservable(WIDTH, HEIGHT)

  return c(aspectRatioRoot, {
    item: c('div', { class: 'page playground-curve-fitting-page' },
      c(section, { title: 'Curve fitting visualizations' },
        c('p', {
          text: 'There is still a lot to be added around here, for now you can play with the interactive chart.'
        })
      ),

      c(aspectRatioBox, {
        ratio: 5 / 4,
        bottomMargin: 25,
        minHeight: 250,
        maxHeight: 500,
        item: c('div', { class: 'curve-canvas-wrapper' },
          c(curveCanvas, observable)
        )
      }),

      c(curveLegend, observable)
    )
  })
}
