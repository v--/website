export interface IBuildContext {
  src: string
  dest: string
  contents: string | ArrayBufferView
}

export interface IBuildWorker {
  performBuild(src: string): AsyncIterable<IBuildContext>
}
