import { type Infer, Schema } from '../validation.ts'

export const PACMAN_PACKAGE_SCHEMA = Schema.object({
  arch: Schema.literal('x86_64', 'any'),
  name: Schema.string,
  version: Schema.string,
  description: Schema.string,
})

export type IPacmanPackage = Infer<typeof PACMAN_PACKAGE_SCHEMA>
export type PacmanPackageArch = IPacmanPackage['arch']

export const PACMAN_REPOSITORY_SCHEMA = Schema.object({
  packages: Schema.array(PACMAN_PACKAGE_SCHEMA),
})

export interface IPacmanRepository extends Infer<typeof PACMAN_REPOSITORY_SCHEMA> {
  packages: IPacmanPackage[]
}

export interface IPacmanService {
  fetchRepository(): Promise<IPacmanRepository>
}
