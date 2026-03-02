import { readFile } from 'node:fs/promises'
import { basename, dirname, join as joinPath, relative } from 'node:path'

import { Schema } from '../../common/validation.ts'
import { readJsonWithSchema } from '../../server/validation.ts'
import { type IBuildContext, type IBuildWorker } from '../build_worker.ts'
import { BuildError } from '../errors.ts'

export class IconBuildError extends BuildError {}

export interface IIconLibraryBuildWorkerConfig {
  srcBase: string
  destBase: string
}

const ICON_LIBRARY_SOURCE_SCHEMA = Schema.array(Schema.string)

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
    const promises = iconSource.map(name => readPathFromIconFile(name))
    const iconObjects = await Promise.all(promises)

    const symbols = iconObjects
      .map(({ name, viewBox, path }) => `<symbol id="${name}" viewBox="${viewBox}"><path d="${path}"/></symbol>`)
      .join('')

    const result = `<?xml version="1.0" encoding="utf-8"?><svg xmlns="http://www.w3.org/2000/svg">${symbols}</svg>`

    yield {
      src,
      dest: this.#getFullDestPath(src),
      contents: result,
    }
  }
}

const FONTAWESOME_SVG_REGEX = /<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="(?<viewBox>.*)">.*<path d="(?<path>.*)"\/><\/svg>/

async function readPathFromIconFile(name: string) {
  const fileName = `submodules/fontawesome/svgs/${name}.svg`
  const svg = await readFile(fileName, 'utf8')
  const match = svg.match(FONTAWESOME_SVG_REGEX)

  if (match === null || match.groups === undefined) {
    throw new IconBuildError(`Unrecognized file format for ${fileName}`)
  }

  return {
    name,
    viewBox: match.groups.viewBox,
    path: match.groups.path,
  }
}
