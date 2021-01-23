declare namespace TGeom2D {
  export interface IVectorParams {
    x: TNum.Float64
    y: TNum.Float64
  }

  export interface IVector extends IVectorParams {
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

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface IFigure {}

  export interface ILineParams {
    a: TNum.Float64
    b: TNum.Float64
    c: TNum.Float64
  }

  export interface ILine extends ILineParams {
    isParallelWith(other: ILine): boolean
    coincidesWith(other: ILine): boolean
    intersectWith(other: ILine): IVector | undefined
    getParallelThrough(point: IVector): ILine
    getNormalLineThrough(point: IVector): ILine
    reflectDirection(point: IVector, direction: IVector): IVector
    orientedDistanceToPoint(point: IVector): TNum.Float64
  }

  export interface IRectangleParams {
    origin: IVector
    dims: IVector
  }

  export interface IRectangle extends IRectangleParams {
    edges: [ILine, ILine, ILine, ILine]
    center: IVector
    containsPoint(point: IVector): boolean
  }

  export interface IEllipseParams {
    center: IVector
    axes: IVector
  }

  export interface IEllipse extends IEllipseParams {
    intersectWithLine(line: ILine): IVector | undefined
    tangentAtLowerSemiellipse(point: IVector): ILine | undefined
  }
}
