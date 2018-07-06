import { readFileSync } from 'fs'

import BrowserSync from 'browser-sync'

const instance = BrowserSync.create()
const config = JSON.parse(readFileSync('config/active.json'))

export default {
  init () {
    instance.init({
      open: false,
      proxy: 'localhost:' + config.server.socket,
      serveStatic: [
        {
          route: '/code',
          dir: './public/code'
        },

        {
          route: '/styles',
          dir: './public/styles'
        },

        {
          route: '/images',
          dir: './public/images'
        }
      ]
    })
  },

  reload () {
    instance.reload()
  },

  stream (options) {
    return instance.stream(options)
  },

  destruct () {
    instance.exit()
  }
}
