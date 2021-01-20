declare namespace TResolution {
  export type TokenType =
    'whitespace' |
    'naturalNumber' |
    'variable' |
    'function' |
    'functionName' |
    'predicateName' |
    'predicate' |
    'negation' |
    'term' |
    'arguments' |
    'formula' |
    'universalQuantification' |
    'existentialQuantification' |
    'conjunction' |
    'disjunction' |
    'implication' |
    'equivalence' |
    'connectiveFormula' |
    'topLevelFormula'

  export type ExpressionType =
    'variable' |
    'function' |
    'predicate' |
    'negation' |
    'universalQuantification' |
    'existentialQuantification' |
    'conjunction' |
    'disjunction' |
    'implication' |
    'equivalence'

  export interface VariableExpression {
    type: 'variable'
    name: string
  }

  export interface FunctionExpression<T = FOLTerm> {
    type: 'function'
    name: string
    args: T[]
  }

  export interface PredicateExpression {
    type: 'predicate'
    name: string
    args: FOLTerm[]
  }

  export interface NegationExpression<T = FOLFormula> {
    type: 'negation'
    formula: T
  }

  export interface QuantificationExpression<T = FOLFormula> {
    type: 'universalQuantification' | 'existentialQuantification'
    variable: string
    formula: T
  }

  export interface ConjunctionExpression<T = FOLFormula> {
    type: 'conjunction'
    formulas: T[]
  }

  export interface DisjunctionExpression<T = FOLFormula> {
    type: 'disjunction'
    formulas: T[]
  }

  export interface ImplicationExpression<T = FOLFormula> {
    type: 'implication'
    formulas: T[]
  }

  export interface EquivalenceExpression<T = FOLFormula> {
    type: 'equivalence'
    formulas: T[]
  }

  export type FOLTerm = VariableExpression | FunctionExpression
  export type FOLAtomicFormula = PredicateExpression
  export type FOLFormula = FOLAtomicFormula | NegationExpression | QuantificationExpression | ConjunctionExpression | DisjunctionExpression | ImplicationExpression | EquivalenceExpression
  export type FOLExpression = FOLTerm | FOLFormula

  export type SimplifiedInnerFormula = FOLAtomicFormula | NegationExpression<SimplifiedInnerFormula> | QuantificationExpression<SimplifiedInnerFormula> | DisjunctionExpression<SimplifiedInnerFormula>
  export type SimplifiedFormula = ConjunctionExpression<SimplifiedFormula> | SimplifiedInnerFormula

  export type PNFInnerFormula = FOLAtomicFormula | NegationExpression<PNFInnerFormula> | DisjunctionExpression<PNFInnerFormula>
  export type PNFFormula = QuantificationExpression<PNFFormula> | ConjunctionExpression<SNFInnerFormula> | PNFInnerFormula

  export type SNFQuantifierFormula = QuantificationExpression<SNFFormula> & { type: 'universalQuantification' }
  export type SNFInnerFormula = FOLAtomicFormula | NegationExpression<SNFInnerFormula> | DisjunctionExpression<SNFInnerFormula>
  export type SNFFormula = SNFQuantifierFormula | ConjunctionExpression<SNFInnerFormula> | SNFInnerFormula

  export type FOLLiteral = FOLAtomicFormula | NegationExpression<FOLAtomicFormula>
  export type FOLDisjunct = FOLLiteral[]

  export interface FOLResolvent {
    index: number
    disjunct: FOLDisjunct
    r1?: FOLResolvent
    r2?: FOLResolvent
    literal?: FOLLiteral
  }
}
