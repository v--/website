import { AssertionError } from 'node:assert/strict'

import { DEFAULT_TOLERANCE, isClose, isGeq, isLeq } from '../common/support/floating.ts'
import { repr } from '../common/support/strings.ts'
import { type float64 } from '../common/types/numbers.ts'

export function assertTrue(value: boolean) {
  if (value !== true) {
    throw new AssertionError({
      message: 'Expected value to be true',
      actual: value,
      expected: true,
      operator: '===',
    })
  }
}

export function assertFalse(value: boolean) {
  if (value !== false) {
    throw new AssertionError({
      message: 'Expected value to be false',
      actual: value,
      expected: false,
      operator: '===',
    })
  }
}

export function assertNull(value: unknown) {
  if (value !== null) {
    throw new AssertionError({
      message: 'Expected value to be null',
      actual: value,
      operator: '===',
    })
  }
}

export function assertUndefined(value: unknown) {
  if (value !== undefined) {
    throw new AssertionError({
      message: 'Expected value to be undefined',
      actual: value,
      operator: '===',
    })
  }
}

export function assertEmpty(object: object) {
  if (Object.keys(object).length > 0) {
    throw new AssertionError({
      message: 'Expected object to be empty',
      actual: object,
    })
  }
}

export function assertNonEmpty(object: object) {
  if (Object.keys(object).length === 0) {
    throw new AssertionError({
      message: 'Expected object to be nonempty',
      actual: object,
    })
  }
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function assertInstanceOf(value: unknown, cls: Function) {
  if (!(value instanceof cls)) {
    throw new AssertionError({
      message: 'Expected value to be an instance',
      actual: value,
      expected: cls,
      operator: 'instanceof',
    })
  }
}

export function assertEqualRepr<T>(a: T, b: T) {
  const aRepr = repr(a)
  const bRepr = repr(b)

  if (aRepr !== bRepr) {
    throw new AssertionError({
      message: 'Expected string representations to match',
      actual: aRepr,
      expected: bRepr,
      operator: 'repr',
    })
  }
}

interface SupportCustomEquality {
  equals(other: unknown): boolean
}

export function assertCustomEqual(a: SupportCustomEquality, b: SupportCustomEquality) {
  if (!a.equals(b)) {
    throw new AssertionError({
      message: "Expected values to match with respect to their 'equals' method.",
      actual: a,
      expected: b,
      operator: '.equals',
    })
  }
}

export function assertSameNumber(a: float64, b: float64, tolerance: float64 = DEFAULT_TOLERANCE) {
  if (!isClose(a, b, tolerance)) {
    throw new AssertionError({
      message: `Expected values to be equal up to ${repr(tolerance)}`,
      actual: a,
      expected: b,
      operator: 'isClose',
    })
  }
}

// eslint-disable-next-line @typescript-eslint/no-restricted-types
export function assertGreaterThan(a: number, b: number, tolerance: float64 = DEFAULT_TOLERANCE) {
  if (!isGeq(a, b, tolerance)) {
    throw new AssertionError({
      message: `Expected value ${repr(a)} to be greater than ${repr(b)} up to ${repr(tolerance)}`,
      actual: a,
      expected: b,
      operator: 'isGeq',
    })
  }
}

// eslint-disable-next-line @typescript-eslint/no-restricted-types
export function assertLessThan(a: number, b: number, tolerance: float64 = DEFAULT_TOLERANCE) {
  if (!isLeq(a, b, tolerance)) {
    throw new AssertionError({
      message: `Expected value ${repr(a)} to be less than ${repr(b)} up to ${repr(tolerance)}`,
      actual: a,
      expected: b,
      operator: 'isLeq',
    })
  }
}
