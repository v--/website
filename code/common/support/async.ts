import { type uint32 } from '../types/numbers.ts'

export function waitForNextMicrotask(): Promise<void> {
  return Promise.resolve()
}

export function waitForTime(milliseconds: uint32): Promise<void> {
  return new Promise(function (resolve, _reject) {
    setTimeout(resolve, milliseconds)
  })
}

export function waitForNextTask(): Promise<void> {
  return waitForTime(0)
}
