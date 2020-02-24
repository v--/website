import { c } from '../../common/rendering/component.js'
import { aspectRatioBox } from '../core/components/aspect_ratio_box.js'
import { DictSubject } from '../../common/observables/dict_subject.js'
import { playgroundTitle } from '../../common/components/playground_title.js'

import { curveCanvas } from './components/curve_canvas.js'
import { curveLegend } from './components/curve_legend.js'
import { fitters } from './fitters.js'
import { NumericMapping } from './support/numeric_mapping.js'

export const ZERO = {
  eval (_x) {
    return 0
  },

  toString () {
    return '0'
  }
}

const WIDTH = 20
const HEIGHT = 16
const DEFAULT_MAPPING = new NumericMapping([[-7, 2], [0, -2], [5, 1], [8, -3]])

function buildCurves (mapping) {
  return fitters
    .map(function (fitter, i) {
      const curve = mapping.n === 0 ? ZERO : fitter.fit(mapping)

      return {
        fitter,
        curve,
        cssClass: 'curve-' + (i + 1)
      }
    })
}

export function index () {
  const subject$ = new DictSubject({
    width: WIDTH,
    height: HEIGHT,
    mapping: DEFAULT_MAPPING,
    fitters: new Set(fitters.filter(f => !f.hideByDefault)),
    curves: buildCurves(DEFAULT_MAPPING),

    updateMapping (x, y) {
      const { mapping } = subject$.value
      const newMapping = mapping.clone()
      newMapping.set(x, y)
      const newCurves = buildCurves(newMapping)
      subject$.update({ mapping: newMapping, curves: newCurves })
    },

    deleteMapping (x) {
      const { mapping } = subject$.value
      const newMapping = mapping.clone()
      newMapping.delete(x)
      const newCurves = buildCurves(newMapping)
      subject$.update({ mapping: newMapping, curves: newCurves })
    },

    enableFitter (fitter) {
      const { fitters } = subject$.value
      const newFitters = new Set(fitters)
      newFitters.add(fitter)
      subject$.update({ fitters: newFitters })
    },

    disableFitter (fitter) {
      const { fitters } = subject$.value
      const newFitters = new Set(fitters)
      newFitters.delete(fitter)
      subject$.update({ fitters: newFitters })
    }
  })

  return c('div', { class: 'page playground-curve-fitting-page' },
    c('div', { class: 'section' },
      c(playgroundTitle, { text: 'Plane curve fitting visualizations' }),
      c('p', {
        class: 'curve-fitting-subtitle',
        text: 'Use the table below to toggle the curves you want to see. Click anywhere on the chart to add or move data points.'
      })
    ),

    c(aspectRatioBox, {
      ratio: 5 / 4,
      bottomMargin: 100,
      minHeight: 250,
      maxHeight: 500,
      item: c(curveCanvas, subject$)
    }),

    c(curveLegend, subject$)
  )
}
