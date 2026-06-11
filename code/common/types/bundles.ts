import { type uint32 } from '../types/numbers.ts'

export const PLAYGROUND_PAGE_IDS = [
  'array-sorting',
  'univariate-interpolation',
  'breakout',
  'fleeing-button',
] as const

export type PlaygroundPageId = typeof PLAYGROUND_PAGE_IDS[uint32]

export const ICON_LIBRARY_IDS = [
  'logo',
  'core',
  'contacts',
  'interactive-table',
  'placeholder',
  'fleeing-button',
] as const

export type IconLibraryId = typeof ICON_LIBRARY_IDS[uint32]

export const TRANSLATION_BUNDLE_IDS = [
  'core',
  'api',
  'interactive-table-error',
  'placeholder',
  'home',
  'files',
  'pacman',
  'playground',
  ...PLAYGROUND_PAGE_IDS,
] as const

export type TranslationBundleId = typeof TRANSLATION_BUNDLE_IDS[uint32]

export const OPEN_GRAPH_IMAGE_IDS = [
  'error',
  'home',
  'files',
  'pacman',
  'playground',
  ...PLAYGROUND_PAGE_IDS,
] as const

export type OpenGraphImageId = typeof OPEN_GRAPH_IMAGE_IDS[uint32]
