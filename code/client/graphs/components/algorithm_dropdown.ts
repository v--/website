import { c } from '../../../common/rendering/component.js'
import { map, flatten } from '../../../common/support/iteration.js'

import { algorithms } from '../algorithms.js'
import { GraphAlgorithmState } from '../types/state.js'

const flattenedAlgorithms = Array.from(flatten(map(ag => ag.algorithms, algorithms)))

export function algorithmDropdown({ algorithm, runAlgorithm }: GraphAlgorithmState<TNum.UInt32>) {
  return c('div', { class: 'algorithm-dropdown' },
    c('select',
      {
        class: 'cool-select',
        change(event: Event) {
          const algorithm = flattenedAlgorithms.find(a => a.name === (event.target as HTMLSelectElement).value)!
          runAlgorithm(algorithm)
        }
      },
      ...map(function(algorithmGroup) {
        return c('optgroup', { label: algorithmGroup.label },
          ...map(function(alg) {
            return c('option', { text: alg.name, selected: alg === algorithm })
          }, algorithmGroup.algorithms))
      }, algorithms)
    )
  )
}
