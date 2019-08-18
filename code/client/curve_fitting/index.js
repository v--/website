import { c } from '../../common/rendering/component.js'
import { aspectRatioPage, aspectRatioBox } from '../core/components/aspect_ratio_page.js'
import { ClientError } from '../../common/errors.js'
import QueryConfig, { NumericMapping, CheckList } from '../../common/support/query_config.js'
import DictSubject from '../../common/observables/dict_subject.js'
import { CHALK_COLORS } from '../core/support/colors.js'

import curveCanvas from './components/curve_canvas.js'
import curveLegend from './components/curve_legend.js'
import fitters from './fitters.js'

export const ZERO = {
  eval (_x) {
    return 0
  },

  toString () {
    return '0'
  }
}

const QUERY_CONFIG_DEFAULTS = Object.freeze({
  mapping: new NumericMapping([[-7, 2], [0, -2], [5, 1], [8, -3]]),
  enabled: new CheckList(fitters, new Set(fitters.filter(f => !f.hideByDefault)))
})

const QUERY_CONFIG_PARSERS = Object.freeze({
  mapping (string) {
    return NumericMapping.fromString(string)
  },

  enabled (string) {
    return CheckList.fromString(fitters, string)
  }
})

const WIDTH = 20
const HEIGHT = 16

export default function playgroundCurveFitting ({ path }) {
  const config = new QueryConfig(path, QUERY_CONFIG_DEFAULTS, QUERY_CONFIG_PARSERS)
  let mapping
  let enabled

  try {
    mapping = config.get('mapping')
    enabled = config.get('enabled')
  } catch (err) {
    console.error(err)
    throw new ClientError('Invalid query string')
  }

  const curves = fitters
    .map(function (fitter, i) {
      const curve = mapping.n === 0 ? ZERO : fitter.fit(mapping)

      return {
        curve,
        fitter,
        color: CHALK_COLORS[i]
      }
    })

  const subject = new DictSubject({
    width: WIDTH,
    height: HEIGHT,
    mapping,
    enabled,
    curves,
    config
  })

  return c(aspectRatioPage, { class: 'page playground-curve-fitting-page' },
    c('div', { class: 'section' },
      c('h1', { class: 'section-title', text: 'Plane curve fitting visualizations' }),
      c('p', {
        class: 'curve-fitting-subtitle',
        text: 'Use the table below to toggle the curves you want to see. Click anywhere on the chart to add or move data points.'
      })
    ),

    c(aspectRatioBox, {
      ratio: 5 / 4,
      bottomMargin: 25,
      minHeight: 250,
      maxHeight: 500,
      item: c(curveCanvas, subject)
    }),

    c(curveLegend, subject)
  )
}
