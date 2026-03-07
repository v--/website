import { type WebsiteEnvironment } from '../environment.ts'
import { type PageDataHydrationTag } from './rehydration.ts'
import { type FactoryComponentType } from '../rendering/component.ts'
import { type UrlPath } from '../support/url_path.ts'
import { type ITranslationSpec } from '../translation.ts'
import { type IconLibraryId, type OpenGraphImageId, type TranslationBundleId } from './bundles.ts'

export type ColorScheme = 'light' | 'dark'
export type NavigationId = 'home' | 'files' | 'pacman' | 'playground'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DefaultPageData = any

export interface IWebsitePageState<T = DefaultPageData> {
  titleSegmentSpecs: ITranslationSpec[]
  descriptionSpec: ITranslationSpec

  translationBundleIds?: TranslationBundleId[]
  iconLibIds?: IconLibraryId[]
  navId?: NavigationId
  ogImageName: OpenGraphImageId

  page: WebsitePage<T>
  pageData: T
  pageDataHydrationTag?: PageDataHydrationTag

  urlPath: UrlPath
  canonicalUrlPath?: UrlPath
}

export type IWebsitePageContext = object
export type WebsitePage<T = DefaultPageData> = FactoryComponentType<IWebsitePageState<T>, WebsiteEnvironment>
