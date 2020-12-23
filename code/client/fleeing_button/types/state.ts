import { Vector } from '../../../common/math/geom2d/vector.js'

export interface SharedState {
  canvasElement: HTMLCanvasElement
  cursor: Vector
}

export interface SubjectState {
  buttonOrigin: Vector
}
