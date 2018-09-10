import { NotFoundError } from '../../common/errors.mjs'

async function fetchJSON (url) {
  const response = await window.fetch(url)

  if (response.status === 404) {
    throw new NotFoundError()
  }

  return response.json()
}

export default class Store {
  constructor ({ data }) {
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
