import { BSpline } from './b_spline.ts'
import { type KnotMapping } from './knot_mapping.ts'
import { Spline } from './spline.ts'
import { zip } from '../../support/iteration.ts'
import { type uint32 } from '../../types/numbers.ts'

export function splineFromKnots(degree: uint32, knots: KnotMapping) {
  const basis = Array.from(iterBasis(degree, knots))
  const n = knots.getNodeCount()
  const x = Array.from(knots.iterX())
  const y = Array.from(knots.iterY())
  const coeff = Array(n).fill(0)

  for (let i = 0; i < n; i++) {
    let prod = 0

    for (let j = 0; j < i; j++) {
      prod += basis[j].eval(x[i]) * coeff[j]
    }

    coeff[i] = (y[i] - prod) / basis[i].eval(x[i])
  }

  return new Spline({ basis, coeff })
}

function* iterExtendedDomain(degree: uint32, knots: KnotMapping) {
  const n = knots.getNodeCount()
  const x = Array.from(knots.iterX())
  // TODO: Remove Array.from once Iterator.prototype.map() proliferates
  const differences = Array.from(zip(x.slice(1), x.slice(0, n - 1))).map(([a, b]) => a - b)
  const diameter = Math.max(1, Math.max(...differences))

  yield x[0] - diameter
  yield* x

  for (let i = 1; i < degree + 1; i++) {
    yield x[n - 1] + i * diameter
  }
}

function* iterBasis(degree: uint32, knots: KnotMapping) {
  const domain = Array.from(iterExtendedDomain(degree, knots))
  const n = knots.getNodeCount()

  for (let i = 0; i < n; i++) {
    yield new BSpline({ points: domain.slice(i, i + degree + 2) })
  }
}
