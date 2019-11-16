import { NotFoundError } from '../../common/errors.js'

async function fetchJSON (url) {
  const response = await window.fetch(url)

  if (response.status === 404) {
    throw new NotFoundError()
  }

  return response.json()
}

export class Store {
  constructor () {
    this.collections = {
      files: {
        readDirectory: (path) => {
          return fetchJSON(`/api/files/${path}`)
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

      pacmanPackages: {
        load () { return data }
      }
    }
  }
}
