import { IDirectory } from './files.js'
import { IPacmanPackage } from './pacman_packages.js'

export interface IFileCollection {
  readDirectory(path: string): Promise<IDirectory>
}

export interface IPacmanPackageCollection {
  load(): Promise<IPacmanPackage[]>
}

export interface IStore {
  collections: {
    files: IFileCollection
    pacmanPackages: IPacmanPackageCollection
  }
}
