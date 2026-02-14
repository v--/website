import { ConvergenceError } from './errors.ts'
import { isClose } from '../../support/floating.ts'
import { type float64, type uint32 } from '../../types/numbers.ts'

export interface NewtonRaphsonIterationConfig {
  functionValue: float64
  derivativeValue: float64
}

export interface NewtonRaphsonMinimizerConfig {
  maxIterations?: uint32
  tolerance?: float64
}

export function newtonRaphsonMin(
  f: (x: float64) => NewtonRaphsonIterationConfig,
  guess: float64,
  { maxIterations, tolerance }: NewtonRaphsonMinimizerConfig = {},
) {
  if (maxIterations === undefined) {
    maxIterations = 100
  }

  if (tolerance === undefined) {
    tolerance = 1e-3
  }

  let oldX = guess
  let newX = guess

  for (let i = 0; i < maxIterations; i++) {
    const { functionValue, derivativeValue } = f(newX)

    if (isClose(derivativeValue, 0, tolerance)) {
      throw new ConvergenceError(`The derivative of ${f.name} is nearly zero on iteration ${i}.`)
    }

    oldX = newX
    newX = oldX - functionValue / derivativeValue

    if (!Number.isFinite(newX)) {
      throw new ConvergenceError(`Reached invalid number ${newX} on iteration ${i} while minimizing ${f.name}.`)
    }

    if (isClose(oldX, newX, tolerance)) {
      return newX
    }
  }

  throw new ConvergenceError(`Could not minimize function ${f.name} in ${maxIterations} iterations.`)
}
