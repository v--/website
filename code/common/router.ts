import { type WebsiteEnvironment } from './environment.ts'
import { errorPage } from './pages/error.ts'
import { filesPage } from './pages/files.ts'
import { homePage } from './pages/home.ts'
import { pacmanPage } from './pages/pacman.ts'
import { placeholder } from './pages/placeholder.ts'
import { playgroundPage } from './pages/playground.ts'
import { EncodedErrorDecoder } from './presentable_errors/decoder.ts'
import { type IEncodedError, PresentableError } from './presentable_errors.ts'
import { includes } from './support/iteration.ts'
import { snakeToKebabCase } from './support/strings.ts'
import { type UrlPath } from './support/url_path.ts'
import { ICON_REF_IDS, PLAYGROUND_PAGE_IDS } from './types/bundles.ts'
import { type IWebsitePageState } from './types/page.ts'

export async function router(urlPath: UrlPath, env: WebsiteEnvironment): Promise<IWebsitePageState> {
  if (urlPath.path.isEmpty()) {
    return {
      titleSegmentSpecs: [{ bundleId: 'core', key: 'global_title_suffix' }],
      descriptionSpec: { bundleId: 'core', key: 'description.home' },
      bundleId: 'core',
      sidebarId: 'home',
      iconRefIds: ['contacts'],
      translationBundleIds: ['home'],
      ogImageName: 'home',
      page: homePage,
      pageData: undefined,
      preload: [{ contentType: 'image', href: '/images/home_page_photo.jpg' }],
      urlPath,
    }
  }

  if (urlPath.path.matchPrefix('files')) {
    const path = urlPath.path.popLeft(1)

    return {
      titleSegmentSpecs: [
        { bundleId: 'files', key: 'page_title', context: { path: urlPath.path.toString() } },
        { bundleId: 'files', key: 'page_title_suffix' },
        { bundleId: 'core', key: 'global_title_suffix' },
      ],
      descriptionSpec: { bundleId: 'core', key: 'description.files' },
      bundleId: 'core',
      sidebarId: 'files',
      iconRefIds: ['interactive_table'],
      translationBundleIds: ['files'],
      ogImageName: 'files',
      page: filesPage,
      pageDataHydrationTag: 'files',
      pageData: await env.services.files.readDirectory(path),
      urlPath,
      canonicalUrlPath: urlPath.pickQueryString('page', 'per-page', 'sort-asc', 'sort-desc'),
    }
  }

  if (urlPath.path.matchFull('pacman')) {
    return {
      titleSegmentSpecs: [
        { bundleId: 'pacman', key: 'page_title' },
        { bundleId: 'core', key: 'global_title_suffix' },
      ],
      descriptionSpec: { bundleId: 'core', key: 'description.pacman' },
      bundleId: 'core',
      sidebarId: 'pacman',
      translationBundleIds: ['pacman'],
      ogImageName: 'pacman',
      page: pacmanPage,
      pageDataHydrationTag: 'pacman',
      pageData: await env.services.pacman.fetchRepository(),
      urlPath,
      canonicalUrlPath: urlPath.pickQueryString(),
    }
  }

  if (urlPath.path.matchFull('playground')) {
    return {
      titleSegmentSpecs: [
        { bundleId: 'core', key: 'playground_title_suffix' },
        { bundleId: 'core', key: 'global_title_suffix' },
      ],
      descriptionSpec: { bundleId: 'core', key: 'description.playground' },
      bundleId: 'core',
      translationBundleIds: ['playground'],
      sidebarId: 'playground',
      ogImageName: 'playground',
      page: playgroundPage,
      pageData: undefined,
      urlPath,
      canonicalUrlPath: urlPath.pickQueryString(),
    }
  }

  for (const playgroundId of PLAYGROUND_PAGE_IDS) {
    if (urlPath.path.matchFull('playground', snakeToKebabCase(playgroundId))) {
      const baseState: Omit<IWebsitePageState, 'translationBundleIds' | 'iconRefIds' | 'page'> = {
        titleSegmentSpecs: [
          { bundleId: playgroundId, key: 'page_title' },
          { bundleId: 'core', key: 'playground_title_suffix' },
          { bundleId: 'core', key: 'global_title_suffix' },
        ],
        descriptionSpec: { bundleId: 'core', key: `description.playground.${playgroundId}` },
        bundleId: playgroundId,
        sidebarId: 'playground',
        ogImageName: 'playground',
        pageData: undefined,
        urlPath,
        canonicalUrlPath: urlPath.pickQueryString(),
      }

      if (env.isContentDynamic()) {
        return {
          ...baseState,
          translationBundleIds: [playgroundId],
          iconRefIds: includes(ICON_REF_IDS, playgroundId) ? ['playground_menu', playgroundId] : ['playground_menu'],
          page: await env.services.page.retrievePlaygroundPage(playgroundId),
        }
      }

      return {
        ...baseState,
        translationBundleIds: ['placeholder'],
        iconRefIds: ['placeholder'],
        page: placeholder,
      }
    }
  }

  throw new PresentableError({ errorKind: 'http', code: 404 })
}

export function createEncodedErrorState(urlPath: UrlPath, encoded: IEncodedError): IWebsitePageState<IEncodedError> {
  const decoder = new EncodedErrorDecoder(encoded)

  return {
    bundleId: 'core',
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
