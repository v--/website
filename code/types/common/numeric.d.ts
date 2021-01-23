declare namespace TNumeric {
  export interface IRealFunction {
    eval(x: TNum.Float64): TNum.Float64
    toString(): string
  }

  export interface IBSplineParams {
    points: TNum.Float64[]
  }

  export interface IBSpline extends IBSplineParams, IRealFunction {
    points: TNum.Float64[]
    degree: TNum.UInt32
  }

  export interface ISplineParams {
    basis: IBSpline[]
    coef: TNum.Float64[]
  }

  export interface ISpline extends ISplineParams, IRealFunction {}
}
