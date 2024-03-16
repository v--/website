import BrowserSync from 'browser-sync'

import { config } from '../server/config'

const instance = BrowserSync.create()

export const sync = {
  init() {
    instance.init({
      open: false,
      proxy: 'localhost:' + config.server.socket,
      serveStatic: [
        {
          route: '/code',
          dir: ['./public/code']
        },

        {
          route: '/styles',
          dir: ['./public/styles']
        },

        {
          route: '/images',
          dir: ['./public/images', './client/assets/images']
        },

        {
          route: '/icons.json',
          dir: ['./public/icons.json']
        },

        {
          route: '/',
          dir: ['./client/assets']
        }
      ]
    })
  },

  reload() {
    instance.reload()
  },

  stream(options: BrowserSync.StreamOptions): NodeJS.ReadWriteStream {
    return instance.stream(options)
  },

  destruct() {
    instance.exit()
  }
}
