import { ManualCache } from '../../../common/cache.ts'
import { ICON_REF_SCHEMA, type IIconRef } from '../../../common/icon_store.ts'
import { type IIconRefService } from '../../../common/services.ts'
import { Path } from '../../../common/support/path.ts'
import { UrlPath } from '../../../common/support/url_path.ts'
import { type IconRefId } from '../../../common/types/bundles.ts'
import { type IRehydrationData } from '../../../common/types/rehydration.ts'
import { validateSchema } from '../../../common/validation.ts'
import { fetchJson } from '../dom.ts'

const BASE_ICONS_PATH = Path.parse('/api/icons')

export class ClientIconRefCache extends ManualCache<IconRefId, IIconRef> {
  override async _resolveValue(refId: IconRefId) {
    const json = await fetchJson(new UrlPath(BASE_ICONS_PATH.pushRight(refId)))
    return validateSchema(ICON_REF_SCHEMA, json)
  }
}

/**
 * A wrapper around /api/icons with manual caching.
 *
 * Either we start with rehydrated data and make no network requests,
 * or we only make one and cache it.
 */
export class ClientIconService implements IIconRefService {
  #cache: ClientIconRefCache

  constructor(rehydratedData: IRehydrationData['iconRefPackage'] | undefined) {
    this.#cache = new ClientIconRefCache()

    if (rehydratedData) {
      for (const { id, ref } of rehydratedData) {
        this.#cache.putIntoCache(id, ref)
      }
    }
  }

  getIconRef(refId: IconRefId) {
    return this.#cache.getValue(refId)
  }

  getIconRefPackage(refIds: IconRefId[]) {
    return Promise.all(
      refIds.map(async refId => {
        return {
          id: refId,
          ref: await this.getIconRef(refId),
        }
      }),
    )
  }

  async finalize() {
    await this.#cache.finalize()
  }
}
