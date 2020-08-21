import { fetchJSON } from './support/dom.js'

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

      gallery: {
        readDirectory () { return data }
      },

      pacmanPackages: {
        load () { return data }
      }
    }
  }
}
