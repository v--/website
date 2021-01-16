import { c } from '../../common/rendering/component.js'
import { sectionTitle } from '../../common/components/section_title.js'
import { aspectRatioBox } from '../core/components/aspect_ratio_box.js'
import { RouterState } from '../../common/support/router_state.js'
import { motifCanvas } from './components/motif_canvas.js'
import { uint32 } from '../../common/types/numeric.js'

import { motifGenerator } from './motif_generator.js'
import { QueryConfig } from '../../common/support/query_config.js'
import { location$ } from '../../common/shared_observables.js'
import { ClientError } from '../../common/errors.js'
import { repr } from '../../common/support/strings.js'
import { randInt } from '../../common/math/prob/random.js'

const QUERY_CONFIG_PARSERS = Object.freeze({
  seed: Number
})

export function index({ path, description }: RouterState) {
  const config = new QueryConfig(path, {}, QUERY_CONFIG_PARSERS)
  const seed = config.get('seed') as uint32

  if (seed === undefined) {
    location$.next(config.getUpdatedPath({ seed: randInt(1, 100) }))
  } else if (!Number.isFinite(seed) || !Number.isInteger(seed) || seed < 1 || seed > 100) {
    throw new ClientError(`The seed ${repr(seed)} must be an integer between 1 and 100`)
  }

  const motif = seed === undefined ? undefined : motifGenerator(seed)

  return c('div', { class: 'page playground-motifs-page' },
    c(sectionTitle, { text: description, path }),
    c('p', { text: 'It is currently very primitive. I plan on experimenting with randomized formal grammars when I have the time.' }),
    motif && c(aspectRatioBox, {
      ratio: 1,
      bottomMargin: 63 /* 4.5rem */,
      minHeight: 250,
      maxHeight: 800,
      item: c(motifCanvas, { motif })
    }),

    c('footer', undefined,
      c(
        'button',
        {
          class: 'cool-button generate-motif-button',
          text: 'Generate new motif',
          click() {
            location$.next(config.getUpdatedPath({ seed: randInt(1, 100) }))
          }
        }
      )
    )
  )
}
