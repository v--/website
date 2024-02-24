import { processData } from './processing.js'

export const processPacmanPackages = processData(
  /**
   * @returns {TPacmanPackages.IPackage | undefined}
   */
  ({ name, version, desc, arch }) => {
    if (typeof name === 'string' &&
      typeof version === 'string' &&
      typeof desc === 'string' &&
      (arch === 'x86_64' || arch === 'any')) {

      return {
        name,
        version,
        desc,
        arch
      }
    }
  }
)
