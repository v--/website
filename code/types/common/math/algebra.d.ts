declare namespace TAlgebra {
  interface IMatrixParams {
    rows: TNum.UInt32
    cols: TNum.UInt32
    payload: TNum.Float64[]
  }

  interface IMatrix extends IMatrixParams {
    get(i: TNum.UInt32, j: TNum.UInt32): TNum.Float64
    set(i: TNum.UInt32, j: TNum.UInt32, value: TNum.Float64): void
    clone(): IMatrix
    transpose(): IMatrix
    equals(other: IMatrix): boolean
    add(other: IMatrix): IMatrix
    sub(other: IMatrix): IMatrix
    mult(other: IMatrix): IMatrix
    scale(scalar: TNum.Float64): IMatrix
    toRows(): TNum.Float64[][]
    toCols(): TNum.Float64[][]
    getRow(j: TNum.UInt32): IMatrix
    getCol(j: TNum.UInt32): IMatrix
    delete(row: TNum.UInt32, col: TNum.UInt32): IMatrix
    getDiagonal(): TNum.Float64[]
  }

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
