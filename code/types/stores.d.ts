declare namespace Stores {
  export interface IFileCollection {
    readDirectory(path: string): Promise<Files.IDirectory>
  }

  export interface IPacmanPackageCollection {
    load(): Promise<PacmanPackages.IPackage[]>
  }

  export interface IStore {
    collections: {
      files: IFileCollection
      pacmanPackages: IPacmanPackageCollection
    }
  }
}
