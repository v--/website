import { type IPacmanRepository, type IPacmanService, PACMAN_REPOSITORY_SCHEMA } from '../../../common/services.ts'
import { UrlPath } from '../../../common/support/url_path.ts'
import { validateSchema } from '../../../common/validation.ts'
import { fetchJson } from '../dom.ts'

const PACMAN_URL_PATH = UrlPath.parse('/api/pacman')

/**
 * A wrapper around /api/pacman with no caching and simple rehydration.
 */
export class ClientPacmanService implements IPacmanService {
  #rehydratedDataUnused = true
  readonly rehydratedData: IPacmanRepository | undefined

  constructor(rehydratedData: IPacmanRepository | undefined) {
    this.rehydratedData = rehydratedData
  }

  async fetchRepository() {
    if (this.#rehydratedDataUnused && this.rehydratedData) {
      this.#rehydratedDataUnused = false
      return this.rehydratedData
    }

    const response = await fetchJson(PACMAN_URL_PATH)
    return validateSchema(PACMAN_REPOSITORY_SCHEMA, response)
  }

  async finalize() {}
}
