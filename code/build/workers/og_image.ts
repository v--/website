import { readFile } from 'node:fs/promises'
import { dirname, join as joinPath, relative } from 'node:path'

import { WEBSITE_LANGUAGE_IDS, type WebsiteLanguageId } from '../../common/languages.ts'
import { SUBSTITUTION_CONTEXT_SCHEMA, substitutePlain } from '../../common/rich.ts'
import { getObjectEntries } from '../../common/support/iteration.ts'
import { OPEN_GRAPH_IMAGE_IDS } from '../../common/types/bundles.ts'
import { Schema } from '../../common/validation.ts'
import { readJsonWithSchema } from '../../server/validation.ts'
import { type IBuildContext, type IBuildWorker } from '../build_worker.ts'
import { BuildError } from '../errors.ts'
import { renderSvg } from '../external.ts'

export class OGImageBuildError extends BuildError {}

export interface IOGImageBuildWorkerConfig {
  srcBase: string
  destBase: string
}

const PREVIEW_GENERATION_SOURCE_SCHEMA = Schema.object({
  images: Schema.record(
    Schema.literal(...OPEN_GRAPH_IMAGE_IDS),
    Schema.record(
      Schema.literal(...WEBSITE_LANGUAGE_IDS),
      Schema.object({
        templatePath: Schema.string,
        context: Schema.optional(SUBSTITUTION_CONTEXT_SCHEMA),
      }),
    ),
  ),
})

export class OGImageBuildWorker implements IBuildWorker {
  readonly config: IOGImageBuildWorkerConfig

  constructor(config: IOGImageBuildWorkerConfig) {
    this.config = config
  }

  #getFullDestPath(src: string, lang: WebsiteLanguageId, name: string): string {
    return joinPath(
      this.config.destBase,
      relative(this.config.srcBase, dirname(src)),
      lang,
      name + '.png',
    )
  }

  async* performBuild(src: string): AsyncIterable<IBuildContext> {
    const config = await readJsonWithSchema(PREVIEW_GENERATION_SOURCE_SCHEMA, src)

    for (const [name, images] of getObjectEntries(config.images)) {
      for (const [lang, { templatePath, context }] of getObjectEntries(images)) {
        const fullTemplatePath = joinPath(this.config.srcBase, templatePath)
        const template = await readFile(fullTemplatePath, 'utf-8')
        const svgString = context ? substitutePlain(template, context) : template
        const pngBuffer = await renderSvg(Buffer.from(svgString, 'utf-8'), dirname(fullTemplatePath))

        yield {
          src,
          dest: this.#getFullDestPath(src, lang, name),
          contents: pngBuffer,
        }
      }
    }
  }
}
