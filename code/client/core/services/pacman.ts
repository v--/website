import { type IPacmanRepository, type IPacmanService, PACMAN_REPOSITORY_SCHEMA } from '../../../common/services.ts'
import { UrlPath } from '../../../common/support/url_path.ts'
import { validateSchema } from '../../../common/validation.ts'
import { HttpClient } from '../dom.ts'

const PACMAN_URL_PATH = UrlPath.parse('/api/pacman')

/**
 * A wrapper around /api/pacman with no caching and simple rehydration.
 */
export class ClientPacmanService implements IPacmanService {
  #rehydratedDataUnused = true
  readonly rehydratedData: IPacmanRepository | undefined
  readonly httpClient: HttpClient

  constructor(httpClient: HttpClient, rehydratedData: IPacmanRepository | undefined) {
    this.httpClient = httpClient
    this.rehydratedData = rehydratedData
  }

  async fetchRepository() {
    if (this.#rehydratedDataUnused && this.rehydratedData) {
      this.#rehydratedDataUnused = false
      return this.rehydratedData
    }

    const response = await this.httpClient.fetchJson(PACMAN_URL_PATH)
    return validateSchema(PACMAN_REPOSITORY_SCHEMA, response)
  }

  async finalize() {}
}
