import { type uint32 } from '../../../common/types/numbers.ts'

export interface ViewportSize {
  width: uint32
  height: uint32
}

export function transposeViewport(size: ViewportSize) {
  return { width: size.height, height: size.width }
}

export const VIEWPORT_SIZE_NAMES = ['Full HD', 'UW Full HD', 'VGA', 'Apple Watch'] as const

export type ViewportSizeName = typeof VIEWPORT_SIZE_NAMES[uint32]

export const viewportNameMap: Record<ViewportSizeName, ViewportSize> = {
  'Full HD': { width: 1920, height: 1080 },
  'UW Full HD': { width: 2560, height: 1080 },
  'VGA': { width: 640, height: 480 },
  'Apple Watch': { width: 312, height: 390 },
}
