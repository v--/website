import { Vector } from '../../../common/math/geom2d/vector.js'
import { Rectangle } from '../../../common/math/geom2d/rectangle.js'
import { float64 } from '../../../common/types/numeric.js'

export function accumulateNumericProperty(element: HTMLElement | null, key: keyof HTMLElement): float64 {
  if (element === null) {
    return 0
  }

  return Number(element[key]) + accumulateNumericProperty(element.parentElement, key)
}

export function getOffset(element: HTMLElement) {
  return new Vector({
    x: accumulateNumericProperty(element, 'offsetLeft'),
    y: accumulateNumericProperty(element, 'offsetTop')
  })
}

export function getDimensions(element: HTMLElement) {
  return new Vector({ x: element.offsetWidth, y: element.offsetHeight })
}

export function getBoundingBox(element: HTMLElement) {
  return new Rectangle({
    origin: getOffset(element),
    dims: getDimensions(element)
  })
}
