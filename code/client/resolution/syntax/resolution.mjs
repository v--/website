import { product, sort } from '../../../common/support/iteration.mjs'
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
    const transform = findTermTransform(t1[i], t2[i])

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
  const inference = disjuncts.map(d => ({ d1: null, d2: null, literal: null, disjunct: d }))
  const disjunctSet = new Set(disjuncts.map(d => stringifyDisjunct(d)))
  let resolventCount = 0

  for (let i = 0; i < inference.length; i++) {
    const d1 = inference[i].disjunct

    for (let j = 0; j < inference.length; j++) {
      if (i === j) {
        continue
      }

      const d2 = inference[j].disjunct

      if (d2.length === 0) {
        return inference.slice(disjuncts.length)
      }

      const resolvent = resolve(d1, d2)

      if (resolvent === null) {
        continue
      } else {
        resolventCount++

        if (!disjunctSet.has(stringifyDisjunct(resolvent.disjunct))) {
          inference.push(Object.assign({ d1: i, d2: j }, resolvent))
        }

        if (resolventCount > 25) {
          return null
        }
      }
    }
  }

  return null
}

export function inferEmptyDisjunct (disjuncts) {
  const inference = inferEmptyDisjunctImpl(disjuncts)

  if (inference === null) {
    return inference
  }

  const usedIndices = new Set([disjuncts.length + inference.length - 1])
  let newIndices = 0

  do {
    newIndices = 0

    for (const index of usedIndices) {
      const resolvent = inference[index - disjuncts.length]

      if (resolvent && !usedIndices.has(resolvent.d1)) {
        newIndices++
        usedIndices.add(resolvent.d1)
      }

      if (resolvent && !usedIndices.has(resolvent.d2)) {
        newIndices++
        usedIndices.add(resolvent.d2)
      }
    }
  } while (newIndices !== 0)

  return sort(usedIndices)
    .filter(i => i >= disjuncts.length)
    .map(i => inference[i - disjuncts.length])
}
