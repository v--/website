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
import { type UrlPath } from './support/url_path.ts'
import { ICON_REF_IDS, PLAYGROUND_PAGE_IDS } from './types/bundles.ts'
import { type IWebsitePageState } from './types/page.ts'

export async function router(urlPath: UrlPath, env: WebsiteEnvironment): Promise<IWebsitePageState> {
  if (urlPath.path.isEmpty()) {
    return {
      titleSpec: { bundleId: 'home', key: 'title' },
      descriptionSpec: { bundleId: 'core', key: 'description.home' },
      bundleId: 'core',
      iconRefIds: ['contacts'],
      translationBundleIds: ['home'],
      sidebarId: 'home',
      page: homePage,
      pageData: undefined,
      preload: [{ contentType: 'image', href: '/images/home_page_photo.jpg' }],
      urlPath,
    }
  }

  if (urlPath.path.matchPrefix('files')) {
    const path = urlPath.path.popLeft(1)

    return {
      titleSpec: { bundleId: 'files', key: 'title', context: { path: urlPath.path.toString() } },
      descriptionSpec: { bundleId: 'core', key: 'description.files' },
      bundleId: 'core',
      iconRefIds: ['interactive_table'],
      translationBundleIds: ['files'],
      sidebarId: 'files',
      page: filesPage,
      pageDataHydrationTag: 'files',
      pageData: await env.services.files.readDirectory(path),
      urlPath,
    }
  }

  if (urlPath.path.matchFull('pacman')) {
    return {
      titleSpec: { bundleId: 'pacman', key: 'title' },
      descriptionSpec: { bundleId: 'core', key: 'description.pacman' },
      bundleId: 'core',
      sidebarId: 'pacman',
      translationBundleIds: ['pacman'],
      page: pacmanPage,
      pageDataHydrationTag: 'pacman',
      pageData: await env.services.pacman.fetchRepository(),
      urlPath,
    }
  }

  if (urlPath.path.matchFull('playground')) {
    return {
      titleSpec: { bundleId: 'playground', key: 'title' },
      descriptionSpec: { bundleId: 'core', key: 'description.playground' },
      bundleId: 'core',
      translationBundleIds: ['playground'],
      sidebarId: 'playground',
      page: playgroundPage,
      pageData: undefined,
      urlPath,
    }
  }

  for (const playgroundId of PLAYGROUND_PAGE_IDS) {
    if (urlPath.path.matchFull('playground', playgroundId)) {
      if (env.isContentDynamic()) {
        return {
          titleSpec: { bundleId: playgroundId, key: 'title' },
          descriptionSpec: { bundleId: 'core', key: `description.playground.${playgroundId}` },
          bundleId: playgroundId,
          translationBundleIds: [playgroundId],
          iconRefIds: includes(ICON_REF_IDS, playgroundId) ? ['playground_menu', playgroundId] : ['playground_menu'],
          sidebarId: 'playground',
          page: await env.services.page.retrievePlaygroundPage(playgroundId),
          pageData: undefined,
          urlPath,
        }
      }

      return {
        titleSpec: { bundleId: playgroundId, key: 'title' },
        descriptionSpec: { bundleId: 'core', key: `description.playground.${playgroundId}` },
        bundleId: playgroundId,
        translationBundleIds: ['placeholder'],
        iconRefIds: ['placeholder'],
        sidebarId: 'playground',
        page: placeholder,
        pageData: undefined,
        urlPath,
      }
    }
  }

  return createEncodedErrorState(urlPath, { errorKind: 'http', code: 404 })
}

export function createEncodedErrorState(urlPath: UrlPath, encoded: IEncodedError): IWebsitePageState<IEncodedError> {
  const decoder = new EncodedErrorDecoder(encoded)

  return {
    bundleId: 'core',
    translationBundleIds: decoder.getBundleIds(),
    titleSpec: decoder.getTitleSpec(),
    descriptionSpec: decoder.getSubtitleSpec(),
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
    bundleId: 'core_error',
    titleKey: 'error.title.fallback',
    subtitleKey: 'error.subtitle.fallback',
  })
}
