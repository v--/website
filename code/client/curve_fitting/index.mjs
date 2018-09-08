import { c } from '../../common/rendering/component.mjs'
import { aspectRatioPage, aspectRatioBox } from '../core/components/aspect_ratio_page.mjs'

import GridObservable from './support/grid_observable.mjs'
import curveCanvas from './components/curve_canvas.mjs'
import curveLegend from './components/curve_legend.mjs'

const WIDTH = 20
const HEIGHT = 16

export default function playgroundCurveFitting () {
  const observable = new GridObservable(WIDTH, HEIGHT)

  return c(aspectRatioPage, { class: 'page playground-curve-fitting-page' },
    c('div', { class: 'section' },
      c('h1', { class: 'section-title', text: 'Curve fitting visualizations' }),
      c('p', {
        class: 'curve-fitting-subtitle',
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
}
