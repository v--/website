import { basename, dirname, join as joinPath, relative } from 'node:path'

import { getObjectEntries } from '../../common/support/iteration.ts'
import { type ITranslationMap } from '../../common/translation.ts'
import { type Infer, Schema } from '../../common/validation.ts'
import { parseMarkdown } from '../../server/markdown.ts'
import { readJsonWithSchema } from '../../server/validation.ts'
import { type IBuildContext, type IBuildWorker } from '../build_worker.ts'

export interface ITranslationMapBuildWorkerConfig {
  srcBase: string
  destBase: string
}

const TRANSLATION_MAP_SOURCE_SCHEMA = Schema.record(
  Schema.string,
  Schema.object({
    entryKind: Schema.literal('plain', 'rich'),
    content: Schema.union(
      Schema.string,
      Schema.array(Schema.string),
    ),
  }),
)

type TranslationMapSource = Infer<typeof TRANSLATION_MAP_SOURCE_SCHEMA>

export class TranslationMapBuildWorker implements IBuildWorker {
  readonly config: ITranslationMapBuildWorkerConfig

  constructor(config: ITranslationMapBuildWorkerConfig) {
    this.config = config
  }

  #getFullDestPath(src: string): string {
    return joinPath(
      this.config.destBase,
      relative(this.config.srcBase, dirname(src)),
      basename(src),
    )
  }

  async* performBuild(src: string): AsyncIterable<IBuildContext> {
    const translationSource = await readJsonWithSchema(TRANSLATION_MAP_SOURCE_SCHEMA, src)
    const parsed: ITranslationMap = Object.fromEntries(
      getObjectEntries(translationSource).map(function ([key, spec]) {
        const content = spec.content instanceof Array ? spec.content.join('\n') : spec.content

        switch (spec.entryKind) {
          case 'plain':
            return [key, content]

          case 'rich':
            return [key, parseMarkdown(content)]
        }
      }),
    )

    yield {
      src,
      dest: this.#getFullDestPath(src),
      contents: JSON.stringify(parsed),
    }
  }
}
