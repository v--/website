import { type IEncodedError, PresentableError } from '../common/presentable_errors.ts'
import { router } from '../common/router.ts'
import { WEBFINGER_ALIASES, WEBFINGER_LINKS } from './constants/webfinger.ts'
import { type ServerWebsiteEnvironment } from './environment.ts'
import { ServerResponse } from './http/response.ts'
import { includes } from '../common/support/iteration.ts'
import { quoteString } from '../common/support/strings.ts'
import { type UrlPath } from '../common/support/url_path.ts'
import { type ITranslationSpec, LANGUAGE_IDS } from '../common/translation.ts'
import { ICON_REF_IDS, TRANSLATION_BUNDLE_IDS } from '../common/types/bundles.ts'

async function errorJsonResponse(env: ServerWebsiteEnvironment, encoded: IEncodedError) {
  return ServerResponse.json(
    env.services.translation.errorFactory.translateEncoding(encoded),
    encoded.errorKind === 'http' ? encoded.code : 500,
  )
}

export async function serverRouter(urlPath: UrlPath, env: ServerWebsiteEnvironment) {
  if (urlPath.path.matchFull('api', 'pacman')) {
    return ServerResponse.json(await env.services.pacman.fetchRepository())
  }

  if (urlPath.path.matchPrefix('api', 'files')) {
    try {
      const path = urlPath.path.popLeft(2)
      const dir = await env.services.files.readDirectory(path)
      return ServerResponse.json(dir)
    } catch (err) {
      if (err instanceof PresentableError) {
        return await errorJsonResponse(env, err.encoded)
      } else {
        throw err
      }
    }
  }

  if (urlPath.path.matchPrefix('api', 'icons') && urlPath.path.segments.length === 3) {
    const refId = urlPath.path.getBaseName()

    if (includes(ICON_REF_IDS, refId)) {
      const iconMap = await env.services.icons.getIconRef(refId)
      return ServerResponse.json(iconMap)
    }
  }

  if (urlPath.path.matchPrefix('api', 'translation') && urlPath.path.segments.length === 3) {
    const bundleId = urlPath.path.getBaseName()
    const languageId = urlPath.query.get('lang')

    if (languageId === undefined) {
      return errorJsonResponse(env, {
        errorKind: 'http',
        code: 400,
        cause: { bundleId: 'server', key: 'error.cause.router.missing_language' },
      })
    }

    if (!includes(LANGUAGE_IDS, languageId)) {
      return errorJsonResponse(env, {
        errorKind: 'http',
        code: 400,
        cause: {
          bundleId: 'server', key: 'error.cause.router.invalid_language',
          context: { lang: quoteString(languageId, 'ticks') },
        },
      })
    }

    if (bundleId === 'server') {
      return errorJsonResponse(env, { errorKind: 'http', code: 403 })
    }

    if (includes(TRANSLATION_BUNDLE_IDS, bundleId)) {
      const translationMap = await env.services.translation.getTranslationMap(bundleId, languageId)
      return ServerResponse.json(translationMap)
    }
  }

  if (urlPath.path.matchPrefix('api')) {
    return errorJsonResponse(env, { errorKind: 'http', code: 404 })
  }

  if (urlPath.path.matchFull('.well-known', 'webfinger')) {
    const resource = urlPath.query.get('resource')

    if (resource === undefined) {
      const cause: ITranslationSpec = { bundleId: 'server', key: 'error.cause.webfinger.no_resource' }
      return errorJsonResponse(env, { errorKind: 'http', code: 400, cause })
    }

    if (!WEBFINGER_ALIASES.includes(resource)) {
      const cause: ITranslationSpec = { bundleId: 'server', key: 'error.cause.webfinger.not_found' }
      return errorJsonResponse(env, { errorKind: 'http', code: 404, cause })
    }

    return ServerResponse.json({
      subject: resource,
      aliases: WEBFINGER_ALIASES.filter(alias => alias !== resource),
      links: WEBFINGER_LINKS,
    })
  }

  const routingResult = await router(urlPath, env)
  return ServerResponse.page(routingResult, 200, env)
}
