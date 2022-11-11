import { product2 } from '../../../common/support/iteration.js'
import { replaceVariables } from './replacement.js'
import { stringifyExpression, stringifyDisjunct } from '../support/stringify.js'

const MAX_RESOLVENT_COUNT = 25

/**
 * @param {TResolution.NameMap} a
 * @param {TResolution.NameMap} b
 */
function joinTransforms(a, b) {
  /** @type {TResolution.NameMap} */
  const joint = new Map()

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

/**
 * @param {TResolution.Term} t1
 * @param {TResolution.Term} t2
 */
export function findTermTransform(t1, t2) {
  /** @type {{ positive: TResolution.NameMap, negative: TResolution.NameMap }} */
  const cumulative = {
    positive: new Map(),
    negative: new Map()
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

/**
 * @param {Array<TResolution.PredicateExpression>} positive
 * @param {Array<TResolution.NegationExpression<TResolution.PredicateExpression>>} negative
 */
function findTransforms(positive, negative) {
  for (const [l1, l2n] of product2(positive, negative)) {
    const l2 = l2n.formula
    /** @type {{ positive: TResolution.NameMap, negative: TResolution.NameMap }} */
    const cumulative = {
      positive: new Map(),
      negative: new Map()
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

/**
 * @param {Array<TResolution.PredicateExpression>} d1
 * @param {Array<TResolution.NegationExpression<TResolution.PredicateExpression>>} d2
 * @param {{
    positive: TResolution.Literal,
    negative: TResolution.Literal,
    nameMap: {
      positive: TResolution.NameMap,
      negative: TResolution.NameMap
    }
  }} transform
 */
function applyTransform(d1, d2, transform) {
  /** @type {TCons.NonStrictMap<string, TResolution.Literal>} */
  const newDisjunctMap = new Map()

  for (const lit of d1) {
    if (lit !== transform.positive) {
      const newLit = /** @type {TResolution.PredicateExpression} */ (
        replaceVariables(lit, transform.nameMap.positive) 
      )

      newDisjunctMap.set(stringifyExpression(newLit), newLit)
    }
  }

  for (const lit of d2) {
    if (lit.formula !== transform.negative) {
      const newLit = /** @type {TResolution.Literal} */ (
        replaceVariables(lit, transform.nameMap.negative) 
      )

      newDisjunctMap.set(stringifyExpression(newLit), newLit)
    }
  }

  return Array.from(newDisjunctMap.values())
}

/**
 * @param {TResolution.Disjunct} d1
 * @param {TResolution.Disjunct} d2
 */
function resolve(d1, d2) {
  const pd1 = /** @type {Array<TResolution.PredicateExpression>} */ (
    d1.filter(literal => literal.type === 'predicate') 
  )

  const nd1 = /** @type {Array<TResolution.NegationExpression<TResolution.PredicateExpression>>} */ (
    d2.filter(literal => literal.type === 'negation') 
  )

  const pd2 = /** @type {Array<TResolution.PredicateExpression>} */ (
    d1.filter(literal => literal.type === 'predicate') 
  )

  const nd2 = /** @type {Array<TResolution.NegationExpression<TResolution.PredicateExpression>>} */ (
    d2.filter(literal => literal.type === 'negation') 
  )

  let transform = findTransforms(pd1, nd2)

  if (transform) {
    return {
      literal: /** @type {TResolution.Literal} */ (replaceVariables(
        replaceVariables(
          transform.positive,
          transform.nameMap.positive
        ),
        transform.nameMap.negative
      )),

      disjunct: applyTransform(
        /** @type {Array<TResolution.PredicateExpression>} */ (d1),
        /** @type {Array<TResolution.NegationExpression<TResolution.PredicateExpression>>} */ (d2),
        transform
      )
    }
  }

  transform = findTransforms(pd2, nd1)

  if (transform) {
    return {
      literal: /** @type {TResolution.Literal} */ replaceVariables(
        replaceVariables(
          transform.positive,
          transform.nameMap.positive
        ),
        transform.nameMap.negative
      ),

      disjunct: applyTransform(
        /** @type {Array<TResolution.PredicateExpression>} */ (d2),
        /** @type {Array<TResolution.NegationExpression<TResolution.PredicateExpression>>} */ (d1),
        transform
      )
    }
  }
}

/**
 * @param {TResolution.Disjunct[]} disjuncts
 * @returns {TResolution.Resolvent[] | undefined}
 */
function inferEmptyDisjunctImpl(disjuncts) {
  /** @type {TResolution.Resolvent[]} */
  const inference = disjuncts.map((d, i) => ({ disjunct: d, index: i }))

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
            literal: /** @type {TResolution.Literal} */ (resolvent.literal),
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

/**
 * @param {TResolution.Disjunct[]} disjuncts
 * @param {TResolution.Resolvent[]} inference
 */
function filterInference(disjuncts, inference) {
  const last = inference[inference.length - 1]
  const filteredSet = new Set([last])
  const indexMap = /** @type {TCons.NonStrictMap<TResolution.Resolvent, TNum.UInt32>} */ (
    new Map([[last, 1]])
  )

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
    resolvent.index = disjuncts.length + filteredSet.size - indexMap.get(resolvent)
  }

  return Array.from(filteredSet)
    .filter(r => Boolean(r.literal))
    .sort(function(a, b) {
      return a.index - b.index
    })
}

/**
 * @param {TResolution.Disjunct[]} disjuncts
 */
export function inferEmptyDisjunct(disjuncts) {
  const inference = inferEmptyDisjunctImpl(disjuncts)

  if (inference) {
    return filterInference(disjuncts, inference)
  }
}
