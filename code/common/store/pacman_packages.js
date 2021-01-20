import { processData } from './processing.js'

export const processPacmanPackages = processData(
  /**
   * @returns {TPacmanPackages.IPackage | undefined}
   */
  ({ name, version, description, arch }) => {
    if (typeof name === 'string' &&
      typeof version === 'string' &&
      typeof description === 'string' &&
      (arch === 'x86_64' || arch === 'any')) {

      return {
        name,
        version,
        description,
        arch
      }
    }
  }
)
