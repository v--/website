import { MathError } from '../errors.ts'

export class UnivariatePolynomialError extends MathError {}
export class ZeroUnivariatePolynomialError extends UnivariatePolynomialError {}
