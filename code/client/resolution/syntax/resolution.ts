import { product2 } from '../../../common/support/iteration.js'
import { replaceVariables } from './replacement.js'
import { stringifyExpression, stringifyDisjunct } from '../support/stringify.js'

const MAX_RESOLVENT_COUNT = 25

type NameTransform = Map<string, Resolution.FOLTerm>

function joinTransforms(a: NameTransform, b: NameTransform) {
  const joint: NameTransform = new Map()

  for (const [key, value] of a.entries()) {
    joint.set(key, value)
  }

  for (const [key, value] of b.entries()) {
    if (joint.has(key)) {
      return null
    }

    joint.set(key, value)
  }

  return joint
}

export function findTermTransform(t1: Resolution.FOLTerm, t2: Resolution.FOLTerm) {
  const cumulative = {
    positive: new Map<string, Resolution.FOLTerm>(),
    negative: new Map<string, Resolution.FOLTerm>()
  }

  if (t1.type === 'variable') {
    cumulative.positive.set(t1.name, t2)
    return cumulative
  }

  if (t2.type === 'variable') {
    cumulative.negative.set(t2.name, t1)
    return cumulative
  }

  if (t1.name !== t2.name) {
    return null
  }

  for (let i = 0; i < t1.args.length; i++) {
    const transform = findTermTransform(t1.args[i], t2.args[i])

    if (!transform) {
      return null
    }

    const cumulativePositive = joinTransforms(cumulative.positive, transform.positive)
    const cumulativeNegative = joinTransforms(cumulative.negative, transform.negative)

    if (!cumulativePositive || !cumulativeNegative) {
      return null
    }

    cumulative.positive = cumulativePositive
    cumulative.negative = cumulativeNegative
  }

  return cumulative
}

function findTransforms(
  positive: Array<Resolution.PredicateExpression>,
  negative: Array<Resolution.NegationExpression<Resolution.PredicateExpression>>
) {
  for (const [l1, l2n] of product2(positive, negative)) {
    const l2 = l2n.formula
    const cumulative = {
      positive: new Map<string, Resolution.FOLTerm>(),
      negative: new Map<string, Resolution.FOLTerm>()
    }

    if (l1.name !== l2.name) {
      continue
    }

    for (let i = 0; i < l1.args.length; i++) {
      const transform = findTermTransform(l1.args[i], l2.args[i])

      if (!transform) {
        return null
      }

      const cumulativePositive = joinTransforms(cumulative.positive, transform.positive)
      const cumulativeNegative = joinTransforms(cumulative.negative, transform.negative)

      if (!cumulativePositive || !cumulativeNegative) {
        return null
      }

      cumulative.positive = cumulativePositive
      cumulative.negative = cumulativeNegative
    }

    return {
      positive: l1,
      negative: l2,
      nameMap: cumulative
    }
  }

  return null
}

function applyTransform(
  d1: Array<Resolution.PredicateExpression>,
  d2: Array<Resolution.NegationExpression<Resolution.PredicateExpression>>,
  transform: {
    positive: Resolution.FOLLiteral,
    negative: Resolution.FOLLiteral,
    nameMap: {
      positive: NameTransform,
      negative: NameTransform
    }
  }
) {
  const newDisjunctMap: TypeCons.NonStrictMap<string, Resolution.FOLLiteral> = new Map()

  for (const lit of d1) {
    if (lit !== transform.positive) {
      const newLit = replaceVariables(lit, transform.nameMap.positive) as Resolution.PredicateExpression
      newDisjunctMap.set(stringifyExpression(newLit), newLit)
    }
  }

  for (const lit of d2) {
    if (lit.formula !== transform.negative) {
      const newLit = replaceVariables(lit, transform.nameMap.negative) as Resolution.NegationExpression<Resolution.PredicateExpression>
      newDisjunctMap.set(stringifyExpression(newLit), newLit)
    }
  }

  return Array.from(newDisjunctMap.values())
}

function resolve(d1: Resolution.FOLDisjunct, d2: Resolution.FOLDisjunct) {
  const pd1 = d1.filter(literal => literal.type === 'predicate') as Array<Resolution.PredicateExpression>
  const nd1 = d2.filter(literal => literal.type === 'negation') as Array<Resolution.NegationExpression<Resolution.PredicateExpression>>
  const pd2 = d1.filter(literal => literal.type === 'predicate') as Array<Resolution.PredicateExpression>
  const nd2 = d2.filter(literal => literal.type === 'negation') as Array<Resolution.NegationExpression<Resolution.PredicateExpression>>

  let transform = findTransforms(pd1, nd2)

  if (transform) {
    return {
      literal: replaceVariables(
        replaceVariables(
          transform.positive,
          transform.nameMap.positive
        ),
        transform.nameMap.negative
      ) as Resolution.FOLLiteral,

      disjunct: applyTransform(
        d1 as Array<Resolution.PredicateExpression>,
        d2 as Array<Resolution.NegationExpression<Resolution.PredicateExpression>>,
        transform
      )
    }
  }

  transform = findTransforms(pd2, nd1)

  if (transform) {
    return {
      literal: replaceVariables(
        replaceVariables(
          transform.positive,
          transform.nameMap.positive
        ),
        transform.nameMap.negative
      ) as Resolution.FOLLiteral,

      disjunct: applyTransform(
        d2 as Array<Resolution.PredicateExpression>,
        d1 as Array<Resolution.NegationExpression<Resolution.PredicateExpression>>,
        transform
      )
    }
  }
}

function inferEmptyDisjunctImpl(disjuncts: Resolution.FOLDisjunct[]): Resolution.FOLResolvent[] | undefined {
  const inference: Resolution.FOLResolvent[] = disjuncts.map((d, i) => ({ disjunct: d, index: i }))
  const disjunctSet = new Set(disjuncts.map(d => stringifyDisjunct(d)))
  let resolventCount = 0

  for (let i = 0; i < inference.length; i++) {
    const r1 = inference[i]

    for (let j = 0; j < inference.length; j++) {
      if (i === j) {
        continue
      }

      const r2 = inference[j]

      if (r2.disjunct.length === 0) {
        return inference.slice(disjuncts.length)
      }

      const resolvent = resolve(r1.disjunct, r2.disjunct)

      if (resolvent) {
        resolventCount++

        if (!disjunctSet.has(stringifyDisjunct(resolvent.disjunct))) {
          inference.push({
            index: inference.length,
            r1,
            r2,
            literal: resolvent.literal,
            disjunct: resolvent.disjunct
          })
        }

        if (resolventCount > MAX_RESOLVENT_COUNT) {
          return
        }
      } else {
        continue
      }
    }
  }
}

function filterInference(disjuncts: Resolution.FOLDisjunct[], inference: Resolution.FOLResolvent[]) {
  const last = inference[inference.length - 1]
  const filteredSet = new Set([last])
  const indexMap = new Map([[last, 1]])
  let newResolvents = 0

  do {
    newResolvents = 0

    for (const resolvent of filteredSet) {
      for (const r of [resolvent.r1, resolvent.r2]) {
        if (r && r.literal && !filteredSet.has(r)) {
          newResolvents++
          filteredSet.add(r)
          indexMap.set(r, filteredSet.size)
        }
      }
    }
  } while (newResolvents !== 0)

  for (const resolvent of inference) {
    resolvent.index = disjuncts.length + filteredSet.size - indexMap.get(resolvent)!
  }

  return Array.from(filteredSet)
    .filter(r => Boolean(r.literal))
    .sort(function(a, b) {
      return a.index - b.index
    })
}

export function inferEmptyDisjunct(disjuncts: Resolution.FOLDisjunct[]) {
  const inference = inferEmptyDisjunctImpl(disjuncts)

  if (inference) {
    return filterInference(disjuncts, inference)
  }
}
