import { schwartzMin } from '../../common/support/iteration.js'

import { Vector } from '../../common/math/geom2d/vector.js'
import { Rectangle } from '../../common/math/geom2d/rectangle.js'

const ZERO_VECTOR = new Vector({ x: 0, y: 0 })
const UNSAFE_DISTANCE = 100
const SPEED = 30

function evadeImpl (canvas, button, mousePosition) {
  const projections = [
    new Vector({ x: button.center.x, y: canvas.origin.y }),
    new Vector({ x: button.center.x, y: canvas.origin.y + canvas.dims.y }),
    new Vector({ x: canvas.origin.x, y: button.center.y }),
    new Vector({ x: canvas.origin.x + canvas.dims.x, y: button.center.y })
  ]

  const nearestProjection = schwartzMin(x => x.distanceTo(button.center), projections)
  const canvasForce = button.center.sub(nearestProjection)
  const mouseForce = button.center.sub(mousePosition)

  if (mouseForce.getNorm() >= UNSAFE_DISTANCE) {
    return ZERO_VECTOR
  }

  if (canvasForce.getNorm() < UNSAFE_DISTANCE) {
    return canvasForce.scaleToNormed().scale(3)
  }

  return mouseForce.scaleToNormed()
}

export function evade (subject, mousePosition) {
  const { button, canvas } = subject.value

  if (canvas === null) {
    return
  }

  const direction = evadeImpl(canvas, button, mousePosition)

  subject.update({
    button: new Rectangle({
      origin: button.origin.add(direction.scale(SPEED)),
      dims: button.dims
    })
  })
}
