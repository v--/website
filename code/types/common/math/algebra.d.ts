declare namespace TAlgebra {
  interface IPolynomialParams {
    coef: TNum.Float64[]
  }

  interface IPolynomial extends IPolynomialParams {
    coef: TNum.Float64[]
    add(other: IPolynomial): IPolynomial
    sub(other: IPolynomial): IPolynomial
    scale(scalar: TNum.Float64): IPolynomial
    mult(other: IPolynomial): IPolynomial
    div(other: IPolynomial): { quot: IPolynomial, rem: IPolynomial }
    eval(scalar: TNum.Float64): TNum.Float64
    order: TNum.UInt32
    leading: TNum.Float64
    equals(other: IPolynomial): boolean
    getDerivative(): IPolynomial
    isZeroPolynomial(): boolean
  }
}
