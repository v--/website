declare namespace PacmanPackages {
  export type Architecture = 'x86_64' | 'any'

  export interface IPackage {
    name: string
    version: string
    description: string
    arch: Architecture
  }
}
