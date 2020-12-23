import { c } from '../../common/rendering/component.js'
import { aspectRatioBox } from '../core/components/aspect_ratio_box.js'
import { DictSubject } from '../../common/observables/dict_subject.js'
import { sectionTitle } from '../../common/components/section_title.js'

import { curveCanvas } from './components/curve_canvas.js'
import { curveLegend } from './components/curve_legend.js'
import { fitters } from './fitters.js'
import { CurveFittingState } from './types/state.js'
import { RouterState } from '../../common/support/router_state.js'
import { IRealFunction } from '../../common/math/types/real_function.js'
import { float64 } from '../../common/types/numeric.js'
import { Curve } from './types/curve.js'

export const ZERO: IRealFunction = {
  eval(_x) {
    return 0
  },

  toString() {
    return '0'
  }
}

const WIDTH = 20
const HEIGHT = 16
const DEFAULT_MAPPING = new Map([[-7, 2], [0, -2], [5, 1], [8, -3]])

function buildCurves(mapping: Map<float64, float64>): Curve[] {
  return fitters
    .map(function(fitter, i) {
      const curve = mapping.size === 0 ? ZERO : fitter.fit(mapping)

      return {
        fitter,
        curve,
        cssClass: 'curve-' + (i + 1)
      }
    })
}

export function index({ path, description }: RouterState) {
  const subject$ = new DictSubject<CurveFittingState>({
    width: WIDTH,
    height: HEIGHT,
    mapping: DEFAULT_MAPPING,
    fitters: new Set(fitters.filter(f => !f.hideByDefault)),
    curves: buildCurves(DEFAULT_MAPPING),

    updateMapping(x, y) {
      const { mapping } = subject$.value
      const newMapping = new Map(mapping.entries())
      newMapping.set(x, y)
      const newCurves = buildCurves(newMapping)
      subject$.update({ mapping: newMapping, curves: newCurves })
    },

    deleteMapping(x) {
      const { mapping } = subject$.value
      const newMapping = new Map(mapping.entries())
      newMapping.delete(x)
      const newCurves = buildCurves(newMapping)
      subject$.update({ mapping: newMapping, curves: newCurves })
    },

    enableFitter(fitter) {
      const { fitters } = subject$.value
      const newFitters = new Set(fitters)
      newFitters.add(fitter)
      subject$.update({ fitters: newFitters })
    },

    disableFitter(fitter) {
      const { fitters } = subject$.value
      const newFitters = new Set(fitters)
      newFitters.delete(fitter)
      subject$.update({ fitters: newFitters })
    }
  })

  return c('div', { class: 'page playground-curve-fitting-page' },
    c(sectionTitle, { text: description, path }),
    c('p', {
      class: 'curve-fitting-subtitle',
      text: 'Use the table below to toggle the curves you want to see. Click anywhere on the chart to add or move data points.'
    }),

    c(aspectRatioBox, {
      ratio: 5 / 4,
      bottomMargin: 100,
      minHeight: 250,
      maxHeight: 600,
      item: c(curveCanvas, subject$)
    }),

    c(curveLegend, subject$)
  )
}
