import { product } from '../../../common/support/iteration.mjs'
import TermType from '../enums/term_type.mjs'
import FormulaType from '../enums/formula_type.mjs'
import { replaceVariables } from './replacement.mjs'
import { stringifyFormula, stringifyDisjunct } from '../support/stringify.mjs'

function joinTransforms (a, b) {
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

export function findTermTransform (t1, t2) {
  const cumulative = { positive: new Map(), negative: new Map() }

  if (t1.type === TermType.VARIABLE) {
    cumulative.positive.set(t1.name, t2)
    return cumulative
  }

  if (t2.type === TermType.VARIABLE) {
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

    cumulative.positive = joinTransforms(cumulative.positive, transform.positive)
    cumulative.negative = joinTransforms(cumulative.negative, transform.negative)

    if (!cumulative.positive || !cumulative.negative) {
      return null
    }
  }

  return cumulative
}

function findTransforms (positive, negative) {
  for (const [l1, l2n] of product(positive, negative)) {
    const l2 = l2n.formula
    const cumulative = { positive: new Map(), negative: new Map() }

    if (l1.name !== l2.name) {
      continue
    }

    for (let i = 0; i < l1.args.length; i++) {
      const transform = findTermTransform(l1.args[i], l2.args[i])

      if (!transform) {
        return null
      }

      cumulative.positive = joinTransforms(cumulative.positive, transform.positive)
      cumulative.negative = joinTransforms(cumulative.negative, transform.negative)

      if (!cumulative.positive || !cumulative.negative) {
        return null
      }
    }

    return {
      positive: l1,
      negative: l2,
      nameMap: cumulative
    }
  }

  return null
}

function applyTransform (d1, d2, transform) {
  const newDisjunctMap = new Map()

  for (const lit of d1) {
    if (lit !== transform.positive) {
      const newLit = replaceVariables(lit, transform.nameMap.positive)
      newDisjunctMap.set(stringifyFormula(newLit), newLit)
    }
  }

  for (const lit of d2) {
    if (lit.formula !== transform.negative) {
      const newLit = replaceVariables(lit, transform.nameMap.negative)
      newDisjunctMap.set(stringifyFormula(newLit), newLit)
    }
  }

  return Array.from(newDisjunctMap.values())
}

function resolve (d1, d2) {
  const pd1 = d1.filter(literal => literal.type === FormulaType.PREDICATE)
  const nd1 = d2.filter(literal => literal.type === FormulaType.NEGATION)
  const pd2 = d1.filter(literal => literal.type === FormulaType.PREDICATE)
  const nd2 = d2.filter(literal => literal.type === FormulaType.NEGATION)

  let transform = findTransforms(pd1, nd2)

  if (transform) {
    return {
      literal: replaceVariables(replaceVariables(transform.positive, transform.nameMap.positive), transform.nameMap.negative),
      disjunct: applyTransform(d1, d2, transform)
    }
  }

  transform = findTransforms(pd2, nd1)

  if (transform) {
    return {
      literal: replaceVariables(replaceVariables(transform.positive, transform.nameMap.positive), transform.nameMap.negative),
      disjunct: applyTransform(d2, d1, transform)
    }
  }

  return null
}

export function inferEmptyDisjunctImpl (disjuncts, iterations = 0) {
  const inference = disjuncts.map((d, i) => ({ d1: null, d2: null, literal: null, disjunct: d, index: i }))
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

      if (resolvent === null) {
        continue
      } else {
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

        if (resolventCount > 25) {
          return null
        }
      }
    }
  }

  return null
}

function filterInference (disjuncts, inference) {
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
    resolvent.index = disjuncts.length + filteredSet.size - indexMap.get(resolvent)
  }

  return Array.from(filteredSet)
    .filter(r => Boolean(r.literal))
    .sort(function (a, b) {
      return a.index - b.index
    })
}

export function inferEmptyDisjunct (disjuncts) {
  const inference = inferEmptyDisjunctImpl(disjuncts)

  if (inference === null) {
    return inference
  }

  return filterInference(disjuncts, inference)
}
