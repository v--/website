export interface IFinalizeable {
  finalize(): Promise<void>
}
