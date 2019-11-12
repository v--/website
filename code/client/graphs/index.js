import { c } from '../../common/rendering/component.js'
import { aspectRatioPage, aspectRatioBox } from '../core/components/aspect_ratio_page.js'
import DictSubject from '../../common/observables/dict_subject.js'
import { createIntervalObservable } from '../core/support/timeout.js'

import Graph from '../core/math/graph.js'

import graphCanvas from './components/graph_canvas.js'

const INTERVAL = 1000

export default function playgroundBreakout () {
  const incidence = [
    [2, 3],
    [0, 2, 4],
    [0, 1, 3, 4],
    [1, 2],
    [1, 2]
  ]

  const loop = [1, 0, 3]
  const subject = new DictSubject({
    i: 1,
    graph: new Graph(incidence).highlightEdge(loop[0], loop[1])
  })

  createIntervalObservable(INTERVAL).subscribe(function () {
    const i = subject.value.i
    const nextI = (i + 1) % loop.length

    subject.update({
      i: nextI,
      graph: subject.value.graph.highlightEdge(loop[i], loop[nextI])
    })
  })

  return c(aspectRatioPage, { class: 'page playground-graphs-page' },
    c('div', { class: 'section' },
      c('h1', { class: 'section-title', text: '[WIP] Graph optimization algorithm visualizations' })
    ),

    c(aspectRatioBox, {
      ratio: 1,
      bottomMargin: 25,
      minHeight: 250,
      maxHeight: 700,
      item: c(graphCanvas, subject)
    })
  )
}
