import { readFile } from 'node:fs/promises'
import { dirname, join as joinPath, relative } from 'node:path'

import { Resvg } from '@resvg/resvg-js'

import { substitutePlain } from '../../common/rich.ts'
import { getObjectEntries } from '../../common/support/iteration.ts'
import { LANGUAGE_IDS, type LanguageId } from '../../common/translation.ts'
import { OPEN_GRAPH_IMAGE_IDS } from '../../common/types/bundles.ts'
import { Schema } from '../../common/validation.ts'
import { readJsonWithSchema } from '../../server/validation.ts'
import { type IBuildContext, type IBuildWorker } from '../build_worker.ts'
import { BuildError } from '../errors.ts'

export class OGImageBuildError extends BuildError {}

export interface IOGImageBuildWorkerConfig {
  srcBase: string
  destBase: string
}

const PREVIEW_GENERATION_SOURCE_SCHEMA = Schema.object({
  fontPath: Schema.string,
  templatePaths: Schema.record(
    Schema.literal(...LANGUAGE_IDS),
    Schema.string,
  ),
  titles: Schema.record(
    Schema.literal(...OPEN_GRAPH_IMAGE_IDS),
    Schema.record(
      Schema.literal(...LANGUAGE_IDS),
      Schema.string,
    ),
  ),
})

export class OGImageBuildWorker implements IBuildWorker {
  readonly config: IOGImageBuildWorkerConfig

  constructor(config: IOGImageBuildWorkerConfig) {
    this.config = config
  }

  #getFullDestPath(src: string, lang: LanguageId, name: string): string {
    return joinPath(
      this.config.destBase,
      relative(this.config.srcBase, dirname(src)),
      lang,
      name + '.png',
    )
  }

  async* performBuild(src: string): AsyncIterable<IBuildContext> {
    const config = await readJsonWithSchema(PREVIEW_GENERATION_SOURCE_SCHEMA, src)

    for (const lang of LANGUAGE_IDS) {
      const template = await readFile(
        joinPath(this.config.srcBase, config.templatePaths[lang]),
        'utf-8',
      )

      for (const [name, titles] of getObjectEntries(config.titles)) {
        const svgString = substitutePlain(template, { title: titles[lang] })

        const resvg = new Resvg(svgString, {
          font: {
            fontFiles: [joinPath(this.config.srcBase, config.fontPath)],
            loadSystemFonts: false,
          },
        })

        const pngBuffer = resvg.render().asPng()

        yield {
          src,
          dest: this.#getFullDestPath(src, lang, name),
          contents: pngBuffer,
        }
      }
    }
  }
}
