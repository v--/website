import { type uint32 } from '../types/numbers.ts'

interface IPaginatorBounds {
  lower: uint32
  upper: uint32
}

/**
 * Try to keep the current page centered when the total number of pages is overfull
 */
export function getPaginatorBounds(currentPage: uint32, pageCount: uint32, radius = 4): IPaginatorBounds {
  const bounds: IPaginatorBounds = { lower: 0, upper: pageCount - 1 }

  if (pageCount > 2 * radius) {
    if (currentPage <= radius) {
      bounds.upper = 2 * radius
    } else if (currentPage >= pageCount - radius) {
      bounds.lower = pageCount - 2 * radius
    } else {
      bounds.lower = currentPage - radius
      bounds.upper = currentPage + radius
    }
  }

  return bounds
}
