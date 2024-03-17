import { processDatum } from './processing.js'

export interface IFile {
  name: string
  isFile: boolean
  modified: string
  size: number
}

export const processFile = processDatum<IFile>(({ name, isFile, modified, size }) => {
  if (typeof name === 'string' &&
    typeof isFile === 'boolean' &&
    typeof modified === 'string' &&
    typeof size === 'number') {

    return {
      name,
      isFile,
      modified,
      size
    }
  }
})

export interface IDirectory {
  readme?: string
  entries: IFile[]
}

export const processDirectory = processDatum<IDirectory>(({ readme, entries }) => {
  if ((typeof readme === 'undefined' || typeof readme === 'string') &&
    entries instanceof Array) {

    return {
      readme,
      entries: entries.map(processFile)
    }
  }
})
