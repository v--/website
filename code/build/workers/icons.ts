import { readFile } from 'node:fs/promises'
import { BuildError } from '../errors'
import { BuildWorker, IBuildContext, ICleanContext } from '../build_worker.js'

const SVG_REGEX = /<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="(.*)">.*<path d="(.*)"\/><\/svg>/

class IconBuildError extends BuildError {}

async function readPathFromIconFile(fileName: string) {
  const svg = await readFile(fileName, 'utf8')
  const match = svg.match(SVG_REGEX)

  if (match === null) {
    throw new IconBuildError(`Unrecognized file format for ${fileName}`)
  }

  return {
    viewBox: match[1],
    path: match[2]
  }
}

export class IconBuildWorker extends BuildWorker {
  constructor(public dest: string) {
    super()
  }

  async * performBuild(src: string): AsyncIterable<IBuildContext> {
    const iconRef: string[] = JSON.parse(await readFile(src, 'utf-8'))
    const promises = iconRef
      .map(async name => {
        return {
          [name]: await readPathFromIconFile(`fontawesome/svgs/${name}.svg`)
        }
      })

    const iconObjects = await Promise.all(promises)
    const result = iconObjects
      .reduce((accum, icon) => ({ ...accum, ...icon }), {})

    yield {
      src,
      dest: this.dest,
      contents: JSON.stringify(result)
    }
  }

  async * performClean(src: string): AsyncIterable<ICleanContext> {
    yield {
      src,
      dest: this.dest
    }
  }
}
