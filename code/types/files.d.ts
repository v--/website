declare namespace Files {
  export interface IFile {
    name: string
    isFile: boolean
    modified: string
    size: number
  }

  export interface IDirectory {
    readme?: string
    entries: IFile[]
  }
}
