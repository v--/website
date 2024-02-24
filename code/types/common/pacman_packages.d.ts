declare namespace TPacmanPackages {
  export type Architecture = 'x86_64' | 'any'

  export interface IPackage {
    name: string
    version: string
    desc: string
    arch: Architecture
  }
}
