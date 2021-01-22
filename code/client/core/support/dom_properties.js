import { Vector } from '../../../common/math/geom2d/vector.js'
import { Rectangle } from '../../../common/math/geom2d/rectangle.js'

/**
 * @param {HTMLElement | null} element
 * @param {keyof HTMLElement} key
 * @returns {TNum.Float64}
 */
export function accumulateNumericProperty(element, key) {
  if (element === null) {
    return 0
  }

  return Number(element[key]) + accumulateNumericProperty(element.parentElement, key)
}

/** @param {HTMLElement} element */
export function getOffset(element) {
  return new Vector({
    x: accumulateNumericProperty(element, 'offsetLeft'),
    y: accumulateNumericProperty(element, 'offsetTop')
  })
}

/** @param {HTMLElement} element */
export function getDimensions(element) {
  return new Vector({ x: element.offsetWidth, y: element.offsetHeight })
}

/** @param {HTMLElement} element */
export function getBoundingBox(element) {
  return new Rectangle({
    origin: getOffset(element),
    dims: getDimensions(element)
  })
}
