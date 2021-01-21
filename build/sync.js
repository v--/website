import { readFile } from 'fs/promises'
import BrowserSync from 'browser-sync'

const instance = BrowserSync.create()
const config = JSON.parse((await readFile('config/active.json')).toString('utf8'))

export const sync = {
  init() {
    instance.init({
      open: false,
      proxy: 'localhost:' + config.server.socket,
      serveStatic: [
        {
          route: '/code',
          dir: ['./code']
        },

        {
          route: '/styles',
          dir: './public/styles'
        },

        {
          route: '/images',
          dir: ['./public/images', './client/assets/images']
        },

        {
          route: '/icons.json',
          dir: ['./public/icons.json']
        }
      ]
    })
  },

  reload() {
    instance.reload()
  },

  /**
   * @param {BrowserSync.StreamOptions} [options]
   * @returns {NodeJS.ReadWriteStream}
   */
  stream(options) {
    return instance.stream(options)
  },

  destruct() {
    instance.exit()
  }
}
