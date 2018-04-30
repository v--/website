/* eslint-env browser */

import { CoolError, HTTPError, NotFoundError } from '../../common/errors'

import Cache from '../support/cache'

function restoreError (errorCls, errorData) {
  switch (errorCls) {
    case 'NotFoundError':
      return new NotFoundError(errorData.viewIDv)

    case 'HTTPError':
      return new HTTPError(errorData.code, errorData.message, errorData.viewID)

    case 'CoolError':
      return new CoolError(errorData.message)

    default:
      return new Error(errorData.message)
  }
}

export default class DB {
  constructor ({ errorData, errorCls, data, dataURL }) {
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

    if (errorData) { this.error = restoreError(errorCls, errorData) }

    if (dataURL) { this.cache.set(dataURL, data) }
  }

  async fetchJSON (url) {
    if (this.error) {
      const error = this.error
      delete this.error
      throw error
    }

    if (this.cache.has(url)) { return this.cache.get(url) }

    const response = await window.fetch(url)

    if (response.status === 404) { throw new NotFoundError(url) }

    const json = await response.json()
    this.cache.set(url, json)
    return json
  }
}
