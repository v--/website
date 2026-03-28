import { type uint32 } from '../types/numbers.ts'

export function waitForNextMicrotask(): Promise<void> {
  return Promise.resolve()
}

export function waitForTime(milliseconds: uint32): Promise<void> {
  const { promise, resolve } = Promise.withResolvers<void>()
  setTimeout(resolve, milliseconds)
  return promise
}

export function waitForNextTask(): Promise<void> {
  return waitForTime(0)
}
