declare namespace TEvents {
  // Missing from TypeScript
  export interface SubmitEvent extends Event {
    submitter: HTMLElement
    target: HTMLFormElement
  }
}
