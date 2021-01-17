import { c } from '../../common/rendering/component.js'
import { form } from '../../common/components/form.js'
import { QueryConfig } from '../../common/support/query_config.js'
import { location$ } from '../../common/shared_observables.js'
import { CoolError } from '../../common/errors.js'
import { sectionTitle } from '../../common/components/section_title.js'

import { stringifyExpression, stringifyDisjunct, stringifyResolvent } from './support/stringify.js'
import { parseExpressionSilently } from './syntax/ast.js'
import { extractPredicates, extractFunctions, extractDisjuncts } from './syntax/extractors.js'
import { simplify } from './syntax/simplification.js'
import { convertToPNF } from './syntax/pnf.js'
import { convertToSNF } from './syntax/snf.js'
import { inferEmptyDisjunct } from './syntax/resolution.js'
import { RouterState } from '../../common/support/router_state.js'

export class ResolutionError extends CoolError {}

export function formulasToText(formulas: Resolution.FOLFormula[]) {
  return { text: formulas.map(stringifyExpression).join('\n') }
}

interface IQueryConfig {
  axioms: string
  goal: string
}

const QUERY_CONFIG_DEFAULTS: IQueryConfig = Object.freeze({
  axioms: [
    'Ay Ez (!p(z) & Ax (q1(z, x) -> !q2(y, x)))',
    'Ay (Az (!r(z) -> !q1(y, z)) -> p(y))'
  ].join(';'),
  goal: 'Az Ey (!r(y) & !q2(z, y))'
})

const QUERY_CONFIG_PARSERS = Object.freeze({
  axioms: String,
  goal: String
})

function parseFormulas(axioms: string[], goal: string) {
  const formulas: Resolution.FOLFormula[] = []

  for (let i = 0; i < axioms.length; i++) {
    const formula = parseExpressionSilently(axioms[i])

    if (formula === undefined) {
      throw new ResolutionError(`Failed to parse axiom ${i + 1}: ${axioms[i]}`)
    } else {
      formulas.push(formula)
    }
  }

  const goalFormula = parseExpressionSilently(goal)

  if (goalFormula === undefined) {
    throw new ResolutionError('Failed to parse the goal: ' + goal)
  } else {
    formulas.push({
      type: 'negation',
      formula: goalFormula
    })
  }

  const nameArityMap = new Map()

  for (const formula of formulas) {
    for (const pred of extractPredicates(formula)) {
      const arity = nameArityMap.get(pred.name)

      if (arity !== undefined && arity !== pred.arity) {
        throw new ResolutionError(`Conflicting arities for predicate ${pred.name}: ${arity} and ${pred.arity}`)
      }

      nameArityMap.set(pred.name, pred.arity)
    }

    for (const func of extractFunctions(formula)) {
      const arity = nameArityMap.get(func.name)

      if (arity !== undefined && arity !== func.arity) {
        throw new ResolutionError(`Conflicting arities for function ${func.name}: ${arity} and ${func.arity}`)
      }

      nameArityMap.set(func.name, func.arity)
    }
  }

  return formulas
}

export function index({ path, description }: RouterState) {
  const config = new QueryConfig<IQueryConfig>(path, QUERY_CONFIG_DEFAULTS, QUERY_CONFIG_PARSERS)
  const axioms = (config.get('axioms') as string).split(';').map(string => string.trim())
  const goal = (config.get('goal') as string)
  let formulas: Resolution.FOLFormula[] = []
  let error = ''

  try {
    formulas = parseFormulas(axioms, goal)
  } catch (err) {
    if (err instanceof ResolutionError) {
      error = String(err)
    } else {
      throw err
    }
  }

  const snfCounter = { value: 1 }
  const simplified = formulas.map(f => simplify(f))
  const pnf = simplified.map(f => convertToPNF(f))
  const snf = pnf.map(f => convertToSNF(f, snfCounter))
  const disjuncts = []

  for (const formula of snf) {
    disjuncts.push(...extractDisjuncts(formula))
  }

  const proof = inferEmptyDisjunct(disjuncts)

  return c('div', { class: 'page playground-resolution-page' },
    c(sectionTitle, { text: description, path }),
    c('p', { text: 'Resolution is a purely syntactic method for proving theorems. It relies on a series of formula transformation that are briefly described below.' }),
    c('p', { text: 'Zero-arity functions are treated as constants and free variables are treated the same as universally quantified variables.' }),
    c('p', { text: 'The raw input syntax is as follows: "A" and "E" are the two quantifiers, "&", "v", "->" and "<->" are the logical connectives and "!" negates formulas. Variables are named x, y, z; functions are named f, g, h; predicates are named p, q, r. All names are allowed to have arbitrary numeric suffixes. Parentheses are mandatory around connectives and illegal elsewhere, except for the parentheses that are parts of function/predicate definitions.' }),
    c(form,
      {
        class: 'resolution-form',
        callback(data: IQueryConfig) {
          const axioms = data.axioms.split('\n').filter(Boolean).join(';')
          const goal = data.goal
          location$.next(config.getUpdatedPath({ axioms, goal }))
        }
      },
      c('label', undefined,
        c('b', { text: 'Axioms' }),
        c('textarea', { name: 'axioms', text: axioms.join('\n'), rows: '4' })
      ),
      c('label', undefined,
        c('b', { text: 'Goal' }),
        c('textarea', { name: 'goal', text: goal, rows: '1' })
      ),
      c('hr', { style: 'visibility: hidden' }),
      c('button', { class: 'cool-button', type: 'submit', text: 'Try to proove' })
    ),

    c('br'),
    error && c('p', { class: 'resolution-error', text: error }),
    !error && c('div', { class: 'resolution-proof' },
      c('h2', { class: 'h2', text: 'Proof' }),
      c('h3', { class: 'h3', text: 'Formulas' }),
      c('p', { text: 'The axioms and the negation of the goal.' }),
      c('pre', undefined,
        c('code', formulasToText(formulas))
      ),

      c('br'),
      c('h3', { class: 'h3', text: 'Resolution.Simplified formulas' }),
      c('p', { text: 'We use the equivalences P → Q ≡ ¬P ∨ Q, P ↔ Q ≡ (¬P ∨ Q) & (P ∨ ¬Q) and P ∨ (Q & R) ≡ (P ∨ Q) & (P ∨ R), de Morgan\'s laws and quantifier inversion rules. The resulting formulas are "almost" in conjunctive normal form but with quantifiers.' }),
      c('pre', undefined,
        c('code', formulasToText(simplified))
      ),

      c('br'),
      c('h3', { class: 'h3', text: 'Prenex normal form' }),
      c('p', { text: 'Duplicate bound variables are renamed to t1, t2, …' }),
      c('pre', undefined,
        c('code', formulasToText(pnf))
      ),

      c('br'),
      c('h3', { class: 'h3', text: 'Skolem normal form' }),
      c('p', { text: 'New functions are named u1, u2, ….' }),
      c('pre', undefined,
        c('code', formulasToText(snf))
      ),

      c('br'),
      c('h3', { class: 'h3', text: 'Disjuncts' }),
      c('p', { text: 'A sequence of disjuncts (sets of literals).' }),
      c('pre', undefined,
        c('code', { text: disjuncts.map((d, i) => String(i + 1) + '. ' + stringifyDisjunct(d)).join('\n') })
      ),

      c('br'),
      c('h3', { class: 'h3', text: 'Proof' }),
      c('p', { text: 'A sequence of derived disjuncts with the input disjuncts and resolution literal specified.' }),
      c('pre', undefined,
        !proof && c('code', { text: 'No proof found in under 25 steps.' }),
        proof && c('code', { text: proof.map((r, i) => String(i + disjuncts.length + 1) + '. ' + stringifyResolvent(r as Required<Resolution.FOLResolvent>)).join('\n') })
      )
    )
  )
}
