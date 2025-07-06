import { readFile } from 'node:fs/promises'
import { basename, dirname, join as joinPath, relative } from 'node:path'

import { type Infer, Schema } from '../../common/validation.ts'
import { readJsonWithSchema } from '../../server/validation.ts'
import { type IBuildContext, type IBuildWorker } from '../build_worker.ts'
import { BuildError } from '../errors.ts'

export class IconBuildError extends BuildError {}

export interface IIconRefBuildWorkerConfig {
  srcBase: string
  destBase: string
}

const ICON_REF_SOURCE_SCHEMA = Schema.array(Schema.string)
type IconRefSource = Infer<typeof ICON_REF_SOURCE_SCHEMA>

export class IconRefBuildWorker implements IBuildWorker {
  readonly config: IIconRefBuildWorkerConfig

  constructor(config: IIconRefBuildWorkerConfig) {
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
    const iconSource: IconRefSource = await readJsonWithSchema(ICON_REF_SOURCE_SCHEMA, src)
    const promises = iconSource
      .map(async name => {
        return {
          [name]: await readPathFromIconFile(`submodules/fontawesome/svgs/${name}.svg`),
        }
      })

    const iconObjects = await Promise.all(promises)
    const result = iconObjects
      .reduce((accum, icon) => ({ ...accum, ...icon }), {})

    yield {
      src,
      dest: this.#getFullDestPath(src),
      contents: JSON.stringify(result),
    }
  }
}

const SVG_REGEX = /<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="(.*)">.*<path d="(.*)"\/><\/svg>/

async function readPathFromIconFile(fileName: string) {
  const svg = await readFile(fileName, 'utf8')
  const match = svg.match(SVG_REGEX)

  if (match === null) {
    throw new IconBuildError(`Unrecognized file format for ${fileName}`)
  }

  return {
    viewBox: match[1],
    path: match[2],
  }
}
