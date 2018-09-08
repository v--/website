import { c } from '../../common/rendering/component.mjs'
import section from '../../common/components/section.mjs'
import { aspectRatioRoot, aspectRatioBox } from '../core/components/aspect_ratio_box.mjs'

import GridObservable from './support/grid_observable.mjs'
import curveCanvas from './components/curve_canvas.mjs'
import curveLegend from './components/curve_legend.mjs'

const WIDTH = 20
const HEIGHT = 16

export default function playgroundCurveFitting () {
  const observable = new GridObservable(WIDTH, HEIGHT)

  return c(aspectRatioRoot, {
    item: c('div', { class: 'page playground-curve-fitting-page' },
      c(section, { title: 'Curve fitting visualizations' },
        c('p', {
          text: 'Click anywhere on the chart to add or move data points.'
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
