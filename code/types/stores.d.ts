declare namespace TStore {
  export interface IFileCollection {
    readDirectory(path: string): Promise<TFiles.IDirectory>
  }

  export interface IPacmanPackageCollection {
    load(): Promise<TPacmanPackages.IPackage[]>
  }

  export interface IStore {
    collections: {
      files: IFileCollection
      pacmanPackages: IPacmanPackageCollection
    }
  }
}
