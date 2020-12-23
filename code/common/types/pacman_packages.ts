import { processData } from './processing.js'

export type PacmanPackageArchitecture = 'x86_64' | 'any'

export interface IPacmanPackage {
  name: string
  version: string
  description: string
  arch: PacmanPackageArchitecture
}

export const processPacmanPackages = processData<IPacmanPackage>(({ name, version, description, arch }) => {
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
})
