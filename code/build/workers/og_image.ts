import { readFile } from 'node:fs/promises'
import { dirname, join as joinPath, relative } from 'node:path'

import { Resvg } from '@resvg/resvg-js'

import { dedent } from '../../common/support/dedent.ts'
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
  backgroundFilePath: string
  faviconFilePath: string
  fontFile: string
}

const PREVIEW_GENERATION_SOURCE_SCHEMA = Schema.record(
  Schema.literal(...OPEN_GRAPH_IMAGE_IDS),
  Schema.record(
    Schema.literal(...LANGUAGE_IDS),
    Schema.string,
  ),
)

// The sizes are based on
// https://www.ogimage.gallery/libary/the-ultimate-guide-to-og-image-dimensions-2024-update
const IMAGE_WIDTH = 1200
const IMAGE_HEIGHT = 630
const FAVICON_SOURCE_DIAMETER = 96
const FAVICON_SCALE = 2.2
const FONT_SIZE = 90

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

  async extractFileSvgTag(path: string) {
    const svgString = await readFile(path, 'utf-8')
    return extractSvgTag(svgString)
  }

  async* performBuild(src: string): AsyncIterable<IBuildContext> {
    const og_imageSource = await readJsonWithSchema(PREVIEW_GENERATION_SOURCE_SCHEMA, src)
    const backgroundTag = await this.extractFileSvgTag(this.config.backgroundFilePath)
    const faviconTag = await this.extractFileSvgTag(this.config.faviconFilePath)

    for (const [name, texts] of getObjectEntries(og_imageSource)) {
      for (const [lang, text] of getObjectEntries(texts)) {
        const svgString = dedent(`\
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${IMAGE_WIDTH} ${IMAGE_HEIGHT}">
            ${backgroundTag}
            <g transform="translate(${(IMAGE_WIDTH - FAVICON_SOURCE_DIAMETER * FAVICON_SCALE) / 2}, 120) scale(${FAVICON_SCALE})">${faviconTag}</g>
            <text x="${IMAGE_WIDTH / 2}" y="480" font-size="${FONT_SIZE}" text-anchor="middle" fill="white">${text}</text>
          </svg>`,
        )

        const resvg = new Resvg(svgString, {
          font: {
            defaultFontFamily: 'PT Sans',
            fontFiles: [this.config.fontFile],
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

function extractSvgTag(svgString: string) {
  const match = svgString.match(/(?<tag><svg.*<\/svg>)/ms)

  if (match === null || match.groups === undefined) {
    throw new OGImageBuildError('Could not extract the SVG tag from an SVG file')
  }

  return match.groups.tag
}
