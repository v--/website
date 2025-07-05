import { ManualCache } from '../../../common/cache.ts'
import { ICON_MAP_SCHEMA, type IIconRef, type IIconService } from '../../../common/services.ts'
import { Path } from '../../../common/support/path.ts'
import { UrlPath } from '../../../common/support/url_path.ts'
import { type IconRefId } from '../../../common/types/bundles.ts'
import { type IRehydrationData } from '../../../common/types/rehydration.ts'
import { validateSchema } from '../../../common/validation.ts'
import { type HttpClient } from '../dom.ts'

const BASE_ICONS_PATH = Path.parse('/api/icons')

export class ClientIconRefCache extends ManualCache<IconRefId, IIconRef> {
  readonly httpClient: HttpClient

  constructor(httpClient: HttpClient) {
    super()
    this.httpClient = httpClient
  }

  override async _resolveValue(refId: IconRefId) {
    const json = await this.httpClient.fetchJson(new UrlPath(BASE_ICONS_PATH.pushRight(refId)))
    return validateSchema(ICON_MAP_SCHEMA, json)
  }
}

/**
 * A wrapper around /api/icons with manual caching.
 *
 * Either we start with rehydrated data and make no network requests,
 * or we only make one and cache it.
 */
export class ClientIconService implements IIconService {
  #cache: ClientIconRefCache

  constructor(httpClient: HttpClient, rehydratedData: IRehydrationData['iconMaps'] | undefined) {
    this.#cache = new ClientIconRefCache(httpClient)

    if (rehydratedData) {
      for (const { refId, map } of rehydratedData) {
        this.#cache.putIntoCache(refId, map)
      }
    }
  }

  async preloadIconRef(refId: IconRefId) {
    await this.#cache.fetchAndCache(refId)
  }

  getIconRef(refId: IconRefId) {
    return this.#cache.getValue(refId)
  }

  getPreloadedIconRef(refId: IconRefId) {
    return this.#cache.getCachedValue(refId)
  }

  async finalize() {
    await this.#cache.finalize()
  }
}
