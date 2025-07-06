import { anchor } from '../../../common/components/anchor.ts'
import { rich } from '../../../common/components/rich.ts'
import { EMPTY, map, switchMap, timeInterval } from '../../../common/observable.ts'
import { c } from '../../../common/rendering/component.ts'
import { type ClientWebsiteEnvironment } from '../../core/environment.ts'
import { TIMELINES } from '../constants.ts'
import { type SortingFrameStore } from '../store.ts'
import { ARRAY_TEMPLATE_KINDS, type ISortingAlgorithm } from '../types.ts'
import { sortingCardArrayBars } from './sorting_card_array_bars.ts'

export interface IArraySortingCardState {
  algorithm: ISortingAlgorithm
  store: SortingFrameStore
}

export function sortingCard({ algorithm, store }: IArraySortingCardState, env: ClientWebsiteEnvironment) {
  const _ = env.gettext.bindToBundle('array_sorting')
  const algorithmPhase$ = store.getAlgorithmPhase$(algorithm.id)
  const algorithmMoment$ = store.getAlgorithmMoment$(algorithm.id)
  const timelines = TIMELINES[algorithm.id]

  algorithmPhase$.pipe(
    switchMap(function (phase) {
      if (phase === 'running') {
        return store.speed$.pipe(
          switchMap(speed => timeInterval(1000 / speed)),
        )
      }

      return EMPTY
    }),
  ).subscribe(function () {
    const moment = store.getAlgorithmMoment(algorithm.id)
    const isComplete = Object.values(timelines).every(timeline => timeline.isComplete(moment))

    if (isComplete) {
      store.updateAlgorithmPhase(algorithm.id, 'completed')
    } else {
      store.updateAlgorithmMoment(algorithm.id, moment + 1)
    }
  })

  return c('div', { class: 'sorting-card' },
    c('h3', { class: 'sorting-card-title' },
      c(anchor, {
        href: _(`algorithm.${algorithm.id}.url`),
        text: _(`algorithm.${algorithm.id}.name`),
      }),
    ),

    c('div', { class: 'sorting-card-array-grid' },
      ...ARRAY_TEMPLATE_KINDS.map(function (templateKind) {
        return c('div', { class: 'sorting-card-array' },
          c('h4', {
            class: 'sorting-card-array-template-kind',
            text: _(`card.array.${templateKind}.name`),
          }),
          c(sortingCardArrayBars, {
            snapshot: algorithmMoment$.pipe(
              map(moment => timelines[templateKind].getSnapshot(moment)),
            ),
          }),
        )
      }),
    ),

    c('div', { class: 'sorting-card-buttons' },
      c('button', {
        class: 'sorting-phase-button',
        text: algorithmPhase$.pipe(
          switchMap(phase => _(`control.run.label.${phase}`)),
        ),
        click() {
          const phase = store.getAlgorithmPhase(algorithm.id)

          switch (phase) {
            case 'running':
              store.updateAlgorithmPhase(algorithm.id, 'paused')
              break

            case 'completed':
              store.resetAlgorithmState(algorithm.id)
            // eslint-disable-next-line no-fallthrough
            default:
              store.updateAlgorithmPhase(algorithm.id, 'running')
          }
        },
      }),

      c('button', {
        class: 'sorting-phase-button',
        text: _('control.reset.label'),
        click() {
          store.resetAlgorithmState(algorithm.id)
        },
      }),
    ),

    c('table', { class: 'sorting-card-info-table' },
      c('tr', undefined,
        c('th', {
          text: _('card.info.header.stable'),
        }),

        c('td', {
          text: _(`card.info.stability.${algorithm.isStable}`),
        }),
      ),

      c('tr', undefined,
        c('th', {
          text: _('card.info.header.time'),
        }),

        c('td', undefined,
          c(rich, {
            mode: 'mathml',
            doc: {
              kind: 'document',
              entries: [algorithm.timeComplexity],
            },
          }),
        ),
      ),

      c('tr', undefined,
        c('th', {
          text: _('card.info.header.space'),
        }),

        c('td', undefined,
          c(rich, {
            mode: 'mathml',
            doc: {
              kind: 'document',
              entries: [algorithm.spaceComplexity],
            },
          }),
        ),
      ),
    ),
  )
}
