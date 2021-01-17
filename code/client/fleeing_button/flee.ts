import { schwartzMin } from '../../common/support/iteration.js'

import { Vector } from '../../common/math/geom2d/vector.js'

import { getBoundingBox, getDimensions } from '../core/support/dom_properties.js'
import { SharedState, SubjectState } from './types/state.js'
import { DictSubject } from '../../common/observables/dict_subject.js'
import { Rectangle } from '../../common/math/geom2d/rectangle.js'

const UNSAFE_DISTANCE = 100
const CANVAS_FORCE_RATIO = 1.5
const SPEED = 50

function getFleeingDirection(canvas: Rectangle, buttonCenter: Vector, cursor: Vector): Optional<Vector> {
  const projections = [
    new Vector({ x: buttonCenter.x, y: canvas.origin.y }),
    new Vector({ x: buttonCenter.x, y: canvas.origin.y + canvas.dims.y }),
    new Vector({ x: canvas.origin.x, y: buttonCenter.y }),
    new Vector({ x: canvas.origin.x + canvas.dims.x, y: buttonCenter.y })
  ]

  const nearestProjection = schwartzMin(x => x.distanceTo(buttonCenter), projections)
  const canvasForce = buttonCenter.sub(nearestProjection)
  const mouseForce = buttonCenter.sub(cursor)

  if (mouseForce.getNorm() >= UNSAFE_DISTANCE) {
    return 
  }

  if (canvasForce.getNorm() < UNSAFE_DISTANCE) {
    return canvasForce.scaleToNormed().scale(CANVAS_FORCE_RATIO)
  }

  return mouseForce.scaleToNormed()
}

export function flee(sharedState: Optional<SharedState>, subject: DictSubject<SubjectState>) {
  if (sharedState === undefined) {
    return
  }

  const { cursor, canvasElement } = sharedState
  const { buttonOrigin } = subject.value

  const canvas = getBoundingBox(canvasElement)
  const buttonDims = getDimensions(canvasElement.firstChild as HTMLElement)
  const buttonCenter = new Vector({
    x: canvas.origin.x + buttonOrigin.x * canvas.dims.x - buttonDims.x / 2,
    y: canvas.origin.y + buttonOrigin.y * canvas.dims.y - buttonDims.y / 2
  })

  const direction = getFleeingDirection(canvas, buttonCenter, cursor)

  if (direction) {
    subject.update({
      buttonOrigin: new Vector({
        x: buttonOrigin.x + direction.x * SPEED / canvas.dims.x,
        y: buttonOrigin.y + direction.y * SPEED / canvas.dims.y
      })
    })
  }
}
