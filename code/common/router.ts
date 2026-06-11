import { type WebsiteEnvironment } from './environment.ts'
import { errorPage } from './pages/error.ts'
import { filesPage } from './pages/files.ts'
import { homePage } from './pages/home.ts'
import { pacmanPage } from './pages/pacman.ts'
import { placeholder } from './pages/placeholder.ts'
import { playgroundPage } from './pages/playground.ts'
import { EncodedErrorDecoder } from './presentable-errors/decoder.ts'
import { type IEncodedError, PresentableError } from './presentable-errors.ts'
import { includes } from './support/iteration.ts'
import { snakeToKebabCase } from './support/strings.ts'
import { type UrlPath } from './support/url-path.ts'
import { ICON_LIBRARY_IDS, PLAYGROUND_PAGE_IDS } from './types/bundles.ts'
import { type IWebsitePageState } from './types/page.ts'

export async function router(urlPath: UrlPath, env: WebsiteEnvironment): Promise<IWebsitePageState> {
  if (urlPath.path.isEmpty()) {
    return {
      titleSegmentSpecs: [{ bundleId: 'core', key: 'global-title-suffix' }],
      descriptionSpec: { bundleId: 'core', key: 'description.home' },
      navId: 'home',
      translationBundleIds: ['home'],
      iconLibIds: ['contacts'],
      ogImageName: 'home',
      page: homePage,
      pageData: undefined,
      urlPath,
      canonicalUrlPath: urlPath.clearQueryString(),
      allowIndexing: urlPath.query.size === 0,
    }
  }

  if (urlPath.path.matchPrefix('files')) {
    const path = urlPath.path.popLeft(1)

    return {
      titleSegmentSpecs: [
        { bundleId: 'files', key: 'page-title', context: { path: urlPath.path.toString() } },
        { bundleId: 'files', key: 'page-title-suffix' },
        { bundleId: 'core', key: 'global-title-suffix' },
      ],
      descriptionSpec: { bundleId: 'core', key: 'description.files' },
      navId: 'files',
      translationBundleIds: ['files'],
      iconLibIds: ['interactive-table'],
      ogImageName: 'files',
      page: filesPage,
      pageDataHydrationTag: 'files',
      pageData: await env.services.files.readDirectory(path),
      urlPath,
      canonicalUrlPath: urlPath.pickQueryString('page', 'per-page', 'sort-asc', 'sort-desc'),
      allowIndexing: urlPath.query.keys().every(key => key === 'page'),
    }
  }

  if (urlPath.path.matchFull('pacman')) {
    return {
      titleSegmentSpecs: [
        { bundleId: 'pacman', key: 'page-title' },
        { bundleId: 'core', key: 'global-title-suffix' },
      ],
      descriptionSpec: { bundleId: 'core', key: 'description.pacman' },
      navId: 'pacman',
      translationBundleIds: ['pacman'],
      ogImageName: 'pacman',
      page: pacmanPage,
      pageDataHydrationTag: 'pacman',
      pageData: await env.services.pacman.fetchRepository(),
      urlPath,
      canonicalUrlPath: urlPath.clearQueryString(),
      allowIndexing: urlPath.query.size === 0,
    }
  }

  if (urlPath.path.matchFull('playground')) {
    return {
      titleSegmentSpecs: [
        { bundleId: 'core', key: 'playground-title-suffix' },
        { bundleId: 'core', key: 'global-title-suffix' },
      ],
      descriptionSpec: { bundleId: 'core', key: 'description.playground' },
      translationBundleIds: ['playground'],
      navId: 'playground',
      ogImageName: 'playground',
      page: playgroundPage,
      pageData: undefined,
      urlPath,
      canonicalUrlPath: urlPath.clearQueryString(),
      allowIndexing: urlPath.query.size === 0,
    }
  }

  for (const playgroundId of PLAYGROUND_PAGE_IDS) {
    if (urlPath.path.matchFull('playground', snakeToKebabCase(playgroundId))) {
      const baseState: Omit<IWebsitePageState, 'translationBundleIds' | 'page'> = {
        titleSegmentSpecs: [
          { bundleId: playgroundId, key: 'page-title' },
          { bundleId: 'core', key: 'playground-title-suffix' },
          { bundleId: 'core', key: 'global-title-suffix' },
        ],
        descriptionSpec: { bundleId: 'core', key: `description.playground.${playgroundId}` },
        navId: 'playground',
        ogImageName: playgroundId,
        pageData: undefined,
        urlPath,
        canonicalUrlPath: urlPath.clearQueryString(),
        allowIndexing: urlPath.query.size === 0,
      }

      if (env.isContentDynamic()) {
        return {
          ...baseState,
          translationBundleIds: [playgroundId],
          iconLibIds: includes(ICON_LIBRARY_IDS, playgroundId) ? [playgroundId] : undefined,
          page: await env.services.page.retrievePlaygroundPage(playgroundId),
        }
      }

      return {
        ...baseState,
        translationBundleIds: ['placeholder'],
        iconLibIds: ['placeholder'],
        page: placeholder,
      }
    }
  }

  throw new PresentableError({ errorKind: 'http', code: 404 })
}

export function createEncodedErrorState(urlPath: UrlPath, encoded: IEncodedError): IWebsitePageState<IEncodedError> {
  const decoder = new EncodedErrorDecoder(encoded)

  return {
    translationBundleIds: decoder.getBundleIds(),
    // We do not put the global title suffix here on purpose
    titleSegmentSpecs: [decoder.getTitleSpec()],
    descriptionSpec: decoder.getSubtitleSpec(),
    ogImageName: 'error',
    page: errorPage,
    pageDataHydrationTag: 'error',
    pageData: encoded,
    urlPath,
  }
}

export function createErrorState(urlPath: UrlPath, err: unknown): IWebsitePageState<IEncodedError> {
  if (err instanceof PresentableError) {
    return createEncodedErrorState(urlPath, err.cause)
  }

  return createEncodedErrorState(urlPath, {
    errorKind: 'generic',
    bundleId: 'core',
    titleKey: 'error.title.fallback',
    subtitleKey: 'error.subtitle.fallback',
  })
}
