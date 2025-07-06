import { DIRECTORY_SCHEMA, type IDirectory, type IFileService } from '../../../common/services.ts'
import { Path } from '../../../common/support/path.ts'
import { UrlPath } from '../../../common/support/url_path.ts'
import { validateSchema } from '../../../common/validation.ts'
import { fetchJson } from '../dom.ts'

/**
 * A wrapper around /api/files that caches the last used path, with a first path
 * provided by rehydration data.
 *
 * Once a user is on a given page and has loaded its data, sorting and paginator
 * navigation will request the same data. So we cache it and reset the cache once
 * we change the subdirectory.
 *
 * If a user navigates away and then back to the same page, the cache will be
 * reset by the ClientRoutingService.
 *
 * We avoid using the ManualCache class because it provides us with no benefits here.
 */
export class ClientFileService implements IFileService {
  #cachedValue?: IDirectory

  constructor(rehydratedData: IDirectory | undefined) {
    if (rehydratedData) {
      this.#cachedValue = rehydratedData
    }
  }

  async readDirectory(path: Path) {
    if (this.#cachedValue && path.toString() === this.#cachedValue.path) {
      return this.#cachedValue
    }

    const response = await fetchJson(new UrlPath(path.pushLeft('api', 'files')))
    this.#cachedValue = validateSchema(DIRECTORY_SCHEMA, response)
    return this.#cachedValue
  }

  resetCache() {
    this.#cachedValue = undefined
  }

  async finalize() {
    this.resetCache()
  }
}
