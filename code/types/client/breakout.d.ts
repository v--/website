declare namespace TBreakout {
  export type GameStatus =
    'unstarted' |
    'running' |
    'paused' |
    'completed' |
    'gameOver'

  export type PaddleDirection = -1 | 0 | 1

  export interface IReflectionParams {
    ball: IGameBall
    figure: TGeom2D.IFigure | undefined
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface IReflection extends IReflectionParams {}

  export interface IGameBallParams {
    center: TGeom2D.IVector
    direction: TGeom2D.IVector
    radius: number
  }

  export interface IGameBall extends IGameBallParams {
    translate(amount: TNum.Float64): IGameBall
    reflectInRect(rect: TGeom2D.IRectangle): IReflection | undefined
    reflectInGameBrick(brick: IGameBrick): IReflection | undefined
    reflectInEllipse(ellipse: TGeom2D.IEllipse): IReflection | undefined
    findClosestReflection(reflectionsIterable: Iterable<IReflection>): IReflection | undefined
  }

  export type GameBrickPower = 1 | 2 | 3

  export interface IGameBrickParams {
    origin: TGeom2D.IVector
    power: GameBrickPower
  }

  export interface IGameBrick extends IGameBrickParams {
    rectangle: TGeom2D.IRectangle
    getHit(): IGameBrick | undefined
    getEvolved(): IGameBrick | undefined
  }

  export interface IGameState {
    eventLoop: TEvents.IEventLoop
    status: GameStatus
    score: TNum.UInt32
    paddleDirection: PaddleDirection
    paddle: TGeom2D.IEllipse
    stage: TGeom2D.IRectangle
    ball: IGameBall
    bricks: IGameBrick[]
  }
}
