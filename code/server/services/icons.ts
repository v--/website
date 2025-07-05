import { ManualCache } from '../../common/cache.ts'
import { ICON_MAP_SCHEMA, type IIconRef, type IIconService } from '../../common/services.ts'
import { type Path } from '../../common/support/path.ts'
import { ICON_REF_IDS, type IconRefId } from '../../common/types/bundles.ts'
import { readJsonWithSchema } from '../validation.ts'

export class ServerIconRefCache extends ManualCache<IconRefId, IIconRef> {
  #basePath: Path

  constructor(basePath: Path) {
    super()
    this.#basePath = basePath
  }

  updateBasePath(basePath: Path) {
    this.#basePath = basePath
  }

  override async _resolveValue(refId: IconRefId) {
    return readJsonWithSchema(
      ICON_MAP_SCHEMA,
      this.#basePath.pushRight(refId + '.json'),
    )
  }
}

export class ServerIconService implements IIconService {
  #cache: ServerIconRefCache

  constructor(basePath: Path) {
    this.#cache = new ServerIconRefCache(basePath)
  }

  async load() {
    this.#cache.invalidateAll()

    for (const refId of ICON_REF_IDS) {
      await this.#cache.fetchAndCache(refId)
    }
  }

  updateFilePath(basePath: Path) {
    this.#cache.updateBasePath(basePath)
  }

  getIconRef(refId: IconRefId) {
    return this.#cache.getValue(refId)
  }

  getPreloadedIconRef(refId: IconRefId) {
    return this.#cache.getCachedValue(refId)
  }

  async finalize() {
    return this.#cache.finalize()
  }
}
