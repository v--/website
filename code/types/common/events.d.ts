declare namespace TEvents {
  // Missing from TypeScript
  export interface SubmitEvent extends Event {
    submitter: HTMLElement
    target: HTMLFormElement
  }

  export interface IEventLoop {
    add(listener: TCons.Action<void>, period: TNum.UInt32): void
    remove(listener: TCons.Action<void>): void
    clear(): void
    start(): void
    stop(): void
  }
}
