import { Vector } from '../../../common/math/geom2d/vector.js'
import { Rectangle } from '../../../common/math/geom2d/rectangle.js'

export function accumulateNumericProperty (element, key) {
  if (element === null) {
    return 0
  }

  return element[key] + accumulateNumericProperty(element.parentElement, key)
}

export function getOffset (element) {
  return new Vector({
    x: accumulateNumericProperty(element, 'offsetLeft'),
    y: accumulateNumericProperty(element, 'offsetTop')
  })
}

export function getDimensions (element) {
  return new Vector({ x: element.offsetWidth, y: element.offsetHeight })
}

export function getBoundingBox (element) {
  return new Rectangle({
    origin: getOffset(element),
    dims: getDimensions(element)
  })
}
