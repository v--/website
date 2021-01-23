declare namespace TBreakout {
  export type GameStatus =
    'unstarted' |
    'running' |
    'paused' |
    'completed' |
    'gameOver'

  export type PaddleDirection = -1 | 0 | 1

  export interface IReflection {
    ball: IGameBall
    figure?: TGeom2D.IFigure
  }

  export interface IGameBallParams {
    center: TGeom2D.IVector
    direction: TGeom2D.IVector
    radius: number
  }

  export interface IGameBall extends IGameBallParams {
    translate(amount: TNum.Float64): IGameBall
    reflectInGameBrick(brick: IGameBrick): IReflection | undefined
    reflectInEllipse(brick: TGeom2D.IEllipse): IReflection | undefined
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
