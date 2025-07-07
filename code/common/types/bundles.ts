import { type uint32 } from '../types/numbers.ts'

export const PLAYGROUND_PAGE_IDS = [
  'array_sorting',
  'univariate_interpolation',
  'breakout',
  'fleeing_button',
] as const

export type PlaygroundPageId = typeof PLAYGROUND_PAGE_IDS[uint32]

export const BUNDLE_IDS = [
  'core',
  ...PLAYGROUND_PAGE_IDS,
] as const

export type BundleId = typeof BUNDLE_IDS[uint32]

export const ICON_REF_IDS = [
  'core',
  'contacts',
  'interactive_table',
  'placeholder',
  'playground_menu',
  'fleeing_button',
] as const

export type IconRefId = typeof ICON_REF_IDS[uint32]

export const TRANSLATION_BUNDLE_IDS = [
  'core',
  'api',
  'interactive_table_error',
  'placeholder',
  'home',
  'files',
  'pacman',
  'playground',
  ...PLAYGROUND_PAGE_IDS,
] as const

export type TranslationBundleId = typeof TRANSLATION_BUNDLE_IDS[uint32]
