import { type WebsiteEnvironment } from '../environment.ts'
import { type PageDataHydrationTag } from './rehydration.ts'
import { type FactoryComponentType } from '../rendering/component.ts'
import { type UrlPath } from '../support/url_path.ts'
import { type ITranslationSpec } from '../translation.ts'
import { type BundleId, type IconRefId, type TranslationBundleId } from './bundles.ts'

export type SidebarId = 'home' | 'files' | 'pacman' | 'playground'
export type ColorScheme = 'light' | 'dark'

export interface IPreloadSpec {
  href: string
  // Taken from
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/preload#what_types_of_content_can_be_preloaded
  contentType: 'fetch' | 'font' | 'image' | 'script' | 'style' | 'track'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DefaultPageData = any

export interface IWebsitePageState<T = DefaultPageData> {
  titleSpec: ITranslationSpec
  descriptionSpec: ITranslationSpec

  bundleId: BundleId
  iconRefIds?: IconRefId[]
  translationBundleIds?: TranslationBundleId[]
  errorTranslationBundleIds?: TranslationBundleId[]
  sidebarId?: SidebarId

  page: WebsitePage<T>
  pageData: T
  pageDataHydrationTag?: PageDataHydrationTag

  preload?: IPreloadSpec[]
  urlPath: UrlPath
}

export type IWebsitePageContext = object
export type WebsitePage<T = DefaultPageData> = FactoryComponentType<IWebsitePageState<T>, WebsiteEnvironment>
