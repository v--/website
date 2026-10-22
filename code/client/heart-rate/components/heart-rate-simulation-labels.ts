import { SvgComponent, createComponent as c } from '../../../common/rendering/component.ts'
import { type float64 } from '../../../common/types/numbers.ts'
import { SIMULATION_BOUNDS } from '../constants.ts'
import { type IPulseCycle } from '../types.ts'

interface IHeartRateSimulationLabelState {
  offset: float64
  pulse: IPulseCycle[]
}

export function heartRateSimulationLabels({ offset, pulse }: IHeartRateSimulationLabelState) {
  return c.svg('g', { class: 'heart-rate-simulation-labels' },
    ...iterSimulationLabels(offset, pulse),
  )
}

const LABEL_Y_TEXT = SIMULATION_BOUNDS.getBottomPos() - 0.05
const LABEL_Y_LINE = LABEL_Y_TEXT - 0.08

function* iterSimulationLabels(stateOffset: float64, pulse: IPulseCycle[]): Generator<SvgComponent> {
  let globalOffset = stateOffset

  for (const cycle of pulse) {
    let offset = globalOffset + cycle.p.offset + cycle.p.duration / 2

    yield c.svg('line', {
      class: 'heart-rate-simulation-label-line',
      x1: offset,
      x2: offset,
      y1: LABEL_Y_LINE,
      y2: -cycle.p.amplitude,
    })

    yield c.svg('text', {
      class: 'heart-rate-simulation-label-text',
      text: 'P',
      x: offset,
      y: LABEL_Y_TEXT,
    })

    offset += cycle.p.duration / 2 + cycle.qrs.offset + cycle.qrs.q.duration / 2

    yield c.svg('line', {
      class: 'heart-rate-simulation-label-line',
      x1: offset,
      x2: offset,
      y1: LABEL_Y_LINE,
      y2: cycle.qrs.q.amplitude,
    })

    offset += cycle.qrs.q.duration / 2 + cycle.qrs.r.duration / 2

    yield c.svg('line', {
      class: 'heart-rate-simulation-label-line heart-rate-simulation-label-line-r',
      x1: offset,
      x2: offset,
      y1: LABEL_Y_LINE,
      y2: -cycle.qrs.r.amplitude,
    })

    yield c.svg('text',
      {
        class: 'heart-rate-simulation-label-text',
        x: offset,
        y: LABEL_Y_TEXT,
      },
      c.svg('tspan', {
        text: 'Q',
      }),
      c.svg('tspan', {
        class: 'heart-rate-simulation-label-text-r',
        text: 'R',
      }),
      c.svg('tspan', {
        text: 'S',
      }),
    )

    offset += cycle.qrs.r.duration / 2 + cycle.qrs.s.duration / 2

    yield c.svg('line', {
      class: 'heart-rate-simulation-label-line',
      x1: offset,
      x2: offset,
      y1: LABEL_Y_LINE,
      y2: cycle.qrs.s.amplitude,
    })

    offset += cycle.qrs.s.duration / 2 + cycle.t.offset + cycle.t.duration / 2

    yield c.svg('line', {
      class: 'heart-rate-simulation-label-line',
      x1: offset,
      x2: offset,
      y1: LABEL_Y_LINE,
      y2: -cycle.t.amplitude,
    })

    yield c.svg('text', {
      class: 'heart-rate-simulation-label-text',
      text: 'T',
      x: offset,
      y: LABEL_Y_TEXT,
    })

    offset += cycle.t.duration / 2 + cycle.u.offset + cycle.u.duration / 2

    yield c.svg('line', {
      class: 'heart-rate-simulation-label-line',
      x1: offset,
      x2: offset,
      y1: LABEL_Y_LINE,
      y2: -cycle.u.amplitude,
    })

    yield c.svg('text', {
      class: 'heart-rate-simulation-label-text',
      text: 'U',
      x: offset,
      y: LABEL_Y_TEXT,
    })

    globalOffset += cycle.duration
  }
}
