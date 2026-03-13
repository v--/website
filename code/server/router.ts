import { type ServerWebsiteEnvironment } from './environment.ts'
import { EncodedErrorDecoder } from '../common/presentable_errors/decoder.ts'
import { type IEncodedError, PresentableError, translateEncoding } from '../common/presentable_errors.ts'
import { router } from '../common/router.ts'
import { ServerResponse } from './http/response.ts'
import { WEBFINGER_ALIASES, WEBFINGER_LINKS } from './meta.ts'
import { API_LANGUAGE, WEBSITE_LANGUAGE_IDS } from '../common/languages.ts'
import { includes } from '../common/support/iteration.ts'
import { quoteString } from '../common/support/strings.ts'
import { type UrlPath } from '../common/support/url_path.ts'
import { type ITranslationSpec } from '../common/translation.ts'
import { TRANSLATION_BUNDLE_IDS } from '../common/types/bundles.ts'

interface IServerRouterOptions {
  rawErrorResponse: boolean
}

export async function serverRouter(urlPath: UrlPath, env: ServerWebsiteEnvironment, options?: IServerRouterOptions) {
  if (urlPath.path.matchFull('api', 'pacman')) {
    try {
      const repo = await env.services.pacman.fetchRepository()
      return ServerResponse.json(repo)
    } catch (err) {
      if (err instanceof PresentableError) {
        return await errorJsonResponse(env, err.cause, options)
      } else {
        throw err
      }
    }
  }

  if (urlPath.path.matchPrefix('api', 'files')) {
    try {
      const path = urlPath.path.popLeft(2)
      const dir = await env.services.files.readDirectory(path)
      return ServerResponse.json(dir)
    } catch (err) {
      if (err instanceof PresentableError) {
        return await errorJsonResponse(env, err.cause, options)
      } else {
        throw err
      }
    }
  }

  if (urlPath.path.matchPrefix('api', 'translation') && urlPath.path.segments.length === 3) {
    const bundleId = urlPath.path.getBaseName()
    const languageId = urlPath.query.get('lang')

    if (languageId === undefined) {
      return errorJsonResponse(
        env,
        {
          errorKind: 'http',
          code: 400,
          details: { bundleId: 'api', key: 'error.details.language_string.missing' },
        },
        options,
      )
    }

    if (!includes(WEBSITE_LANGUAGE_IDS, languageId)) {
      return errorJsonResponse(
        env,
        {
          errorKind: 'http',
          code: 400,
          details: {
            bundleId: 'api', key: 'error.details.language_string.invalid',
            context: { lang: quoteString(languageId, 'ticks') },
          },
        },
        options,
      )
    }

    if (bundleId === 'server') {
      return errorJsonResponse(env, { errorKind: 'http', code: 403 })
    }

    if (includes(TRANSLATION_BUNDLE_IDS, bundleId)) {
      const translationMaps = await env.services.translationMaps.getTranslationMap(languageId, bundleId)
      return ServerResponse.json(translationMaps)
    }
  }

  if (urlPath.path.matchPrefix('api')) {
    return errorJsonResponse(env, { errorKind: 'http', code: 404 }, options)
  }

  if (urlPath.path.matchFull('.well-known', 'webfinger')) {
    const resource = urlPath.query.get('resource')

    if (resource === undefined) {
      const details: ITranslationSpec = { bundleId: 'api', key: 'error.details.webfinger.no_resource' }
      return errorJsonResponse(env, { errorKind: 'http', code: 400, details }, options)
    }

    if (!WEBFINGER_ALIASES.includes(resource)) {
      const details: ITranslationSpec = { bundleId: 'api', key: 'error.details.webfinger.not_found' }
      return errorJsonResponse(env, { errorKind: 'http', code: 404, details }, options)
    }

    return ServerResponse.json(
      {
        subject: resource,
        aliases: WEBFINGER_ALIASES.filter(alias => alias !== resource),
        links: WEBFINGER_LINKS,
      },
      {
        mimeType: 'application/jrd+json',
      },
    )
  }

  const routingResult = await router(urlPath, env)
  await env.preloadPageData(routingResult)
  return ServerResponse.page(routingResult, env, { code: 200 })
}

async function errorJsonResponse(env: ServerWebsiteEnvironment, encoded: IEncodedError, options?: IServerRouterOptions) {
  if (options?.rawErrorResponse) {
    return ServerResponse.json(
      encoded,
      { code: encoded.errorKind === 'http' ? encoded.code : 500 },
    )
  }

  const decoder = new EncodedErrorDecoder(encoded)
  await env.preloadTranslationPackage(API_LANGUAGE, decoder.getBundleIds())

  return ServerResponse.json(
    translateEncoding(env.gettext, encoded),
    { code: encoded.errorKind === 'http' ? encoded.code : 500 },
  )
}
