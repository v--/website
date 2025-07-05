import { basename, dirname, join as joinPath, relative } from 'node:path'

import { getObjectEntries } from '../../common/support/iteration.ts'
import { type ITranslationMap } from '../../common/translation.ts'
import { type Infer, Schema } from '../../common/validation.ts'
import { parseMarkdown } from '../../server/markdown.ts'
import { readJsonWithSchema } from '../../server/validation.ts'
import { type IBuildContext, type IBuildWorker } from '../build_worker.ts'

export interface ITranslationIBuildWorkerConfig {
  srcBase: string
  destBase: string
}

const TRANSLATION_SOURCE_SCHEMA = Schema.record(
  Schema.object({
    entryKind: Schema.literal('plain', 'rich'),
    content: Schema.union(
      Schema.string,
      Schema.array(Schema.string),
    ),
  }),
)

type TranslationSource = Infer<typeof TRANSLATION_SOURCE_SCHEMA>

export class TranslationIBuildWorker implements IBuildWorker {
  readonly config: ITranslationIBuildWorkerConfig

  constructor(config: ITranslationIBuildWorkerConfig) {
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
    const translationSource: TranslationSource = await readJsonWithSchema(TRANSLATION_SOURCE_SCHEMA, src)
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
