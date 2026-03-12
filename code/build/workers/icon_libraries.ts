import { readFile } from 'node:fs/promises'
import { basename, dirname, join as joinPath, relative } from 'node:path'

import { type Infer, Schema } from '../../common/validation.ts'
import { readJsonWithSchema } from '../../server/validation.ts'
import { type IBuildContext, type IBuildWorker } from '../build_worker.ts'
import { BuildError } from '../errors.ts'

export class IconBuildError extends BuildError {}

export interface IIconLibraryBuildWorkerConfig {
  srcBase: string
  destBase: string
}

export const ICON_CONFIG_SCHEMA = Schema.object({
  pack: Schema.string,
  name: Schema.string,
  exportAs: Schema.optional(Schema.string),
})

export type IIconConfig = Infer<typeof ICON_CONFIG_SCHEMA>

const ICON_LIBRARY_SOURCE_SCHEMA = Schema.array(ICON_CONFIG_SCHEMA)

export class IconLibraryBuildWorker implements IBuildWorker {
  readonly config: IIconLibraryBuildWorkerConfig

  constructor(config: IIconLibraryBuildWorkerConfig) {
    this.config = config
  }

  #getFullDestPath(src: string): string {
    return joinPath(
      this.config.destBase,
      relative(this.config.srcBase, dirname(src)),
      basename(src, '.json') + '.svg',
    )
  }

  async* performBuild(src: string): AsyncIterable<IBuildContext> {
    const iconSource = await readJsonWithSchema(ICON_LIBRARY_SOURCE_SCHEMA, src)
    const iconObjects = await Promise.all(iconSource.map(readPathFromIconFile))

    const symbols = iconObjects
      .map(({ config, viewBox, contents }) => `<symbol id="${config.exportAs ?? config.name}" viewBox="${viewBox}">${contents}</symbol>`)
      .join('')

    const result = `<?xml version="1.0" encoding="utf-8"?><svg xmlns="http://www.w3.org/2000/svg">${symbols}</svg>`

    yield {
      src,
      dest: this.#getFullDestPath(src),
      contents: result,
    }
  }
}

const BOXICON_SVG_REGEX = /<svg xmlns="http:\/\/www.w3.org\/2000\/svg" (viewBox="(?<viewBox>[^"]+)" )?width="(?<width>\d+)" height="(?<height>\d+)">(?<contents>.*)<\/svg>/

async function readPathFromIconFile(config: IIconConfig) {
  const filePath = `node_modules/@boxicons/core/svg/${config.pack}/bx-${config.name}.svg`
  let svg: string

  try {
    svg = await readFile(filePath, 'utf-8')
  } catch (err) {
    if (err instanceof Error && 'code' in err && err.code === 'ENOENT') {
      throw new IconBuildError(`Cannot find icon with name ${config.name} in pack ${config.pack}`)
    }

    throw err
  }

  const match = svg.match(BOXICON_SVG_REGEX)

  if (match === null || match.groups === undefined) {
    throw new IconBuildError(`Could not parse SVG for icon ${config.name} from pack ${config.pack}`)
  }

  return {
    config,
    viewBox: match.groups.viewBox ?? `0 0 ${match.groups.width} ${match.groups.height}`,
    contents: match.groups.contents,
  }
}
