import { s } from '../../../common/rendering/component.ts'
import { classlist } from '../../../common/support/dom_properties.ts'
import { ARRAY_SIZE } from '../constants.ts'
import { type ISortingTimelineSnapshot } from '../types.ts'

export interface ISortingCardArrayGridState {
  snapshot: ISortingTimelineSnapshot
}

const BAR_VISUAL_HPADDING = 0.1
const BAR_VISUAL_WIDTH = 1 - 2 * BAR_VISUAL_HPADDING
const BAR_ASPECT_RATIO = 7 / 3
const SVG_VIEW_BOX = [0, 0, ARRAY_SIZE, ARRAY_SIZE / BAR_ASPECT_RATIO].join(' ')

export function sortingCardArrayBars({ snapshot }: ISortingCardArrayGridState) {
  const { action, array } = snapshot

  return s('svg', { class: 'sorting-card-array-bars', viewBox: SVG_VIEW_BOX },
    ...array.map(function (value, k) {
      return s('rect', {
        class: classlist(
          'sorting-card-array-bar',
          action && (action.i === k || action.j === k) &&
          (action.swapped ? 'sorting-card-array-bar-success' : 'sorting-card-array-bar-danger'),
        ),
        width: BAR_VISUAL_WIDTH,
        height: value / BAR_ASPECT_RATIO,
        x: k + BAR_VISUAL_HPADDING,
        y: 0,
      })
    }),
  )
}
