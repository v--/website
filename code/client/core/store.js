import { ForbiddenError, NotFoundError } from '../../common/errors.js'

async function fetchJSON (url) {
  const response = await window.fetch(url)

  switch (response.status) {
    case 403:
      throw new ForbiddenError()

    case 404:
      throw new NotFoundError()

    default:
      return response.json()
  }
}

export class Store {
  constructor () {
    this.collections = {
      files: {
        readDirectory: (path) => {
          return fetchJSON(`/api/files/${path}`)
        }
      },

      gallery: {
        readDirectory: (path) => {
          return fetchJSON(`/api/gallery/${path}`)
        }
      },

      pacmanPackages: {
        load: () => {
          return fetchJSON('/api/pacman')
        }
      }
    }
  }
}

export class MockStore {
  constructor (data) {
    this.collections = {
      files: {
        readDirectory () { return data }
      },

      gallery: {
        readDirectory () { return data }
      },

      pacmanPackages: {
        load () { return data }
      }
    }
  }
}
