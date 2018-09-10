import { NotFoundError } from '../../common/errors.mjs'

import Cache from './support/cache.mjs'

export default class DB {
  constructor ({ data, dataURL }) {
    this.cache = new Cache(60 * 1000)
    this.collections = {
      files: {
        readDirectory: async (path) => {
          return this.fetchJSON(`/api/files/${path}`)
        }
      },

      pacmanPackages: {
        load: async () => {
          return this.fetchJSON('/api/pacman')
        }
      }
    }

    if (dataURL) {
      this.cache.set(dataURL, data)
    }
  }

  async fetchJSON (url) {
    if (this.cache.has(url)) {
      return this.cache.get(url)
    }

    const response = await window.fetch(url)

    if (response.status === 404) {
      throw new NotFoundError()
    }

    const json = await response.json()
    this.cache.set(url, json)
    return json
  }
}
