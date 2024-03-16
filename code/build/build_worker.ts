export interface IBuildContext {
  src: string
  dest: string
  contents: string | NodeJS.ArrayBufferView
}

export interface ICleanContext {
  src: string
  dest: string
}

export abstract class BuildWorker {
  abstract performBuild(path: string): AsyncIterable<IBuildContext>;
  abstract performClean(path: string): AsyncIterable<ICleanContext>;
}
