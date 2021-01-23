declare namespace TGeom2D {
  interface IVectorParams {
    x: TNum.Float64
    y: TNum.Float64
  }

  interface IVector extends IVectorParams {
    x: TNum.Float64
    y: TNum.Float64
    add(other: IVector): IVector
    sub(other: IVector): IVector
    scale(amount: TNum.Float64): IVector
    scaleToNormed(): IVector
    getNorm(): TNum.Float64
    distanceTo(other: IVector): TNum.Float64
    isZeroVector(): boolean
    isUnidirectionalWith(other: IVector): boolean
    convexSum(other: IVector, coef: TNum.Float64): IVector
  }
}
