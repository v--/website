import { processDatum } from './processing.js'

export const processFile = processDatum(
  /**
   * @returns {Files.IFile | undefined}
   */
  ({ name, isFile, modified, size }) => {
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
  }
)

export const processDirectory = processDatum(
  /**
   * @returns {Files.IDirectory | undefined}
   */
  ({ readme, entries }) => {
    if ((typeof readme === 'undefined' || typeof readme === 'string') &&
      entries instanceof Array) {

      return {
        readme,
        entries: entries.map(processFile)
      }
    }
  }
)
