const { readFileSync } = require('fs')
const BrowserSync = require('browser-sync')

const instance = BrowserSync.create()
const config = JSON.parse(readFileSync('config/active.json'))

module.exports = {
  sync: {
    init () {
      instance.init({
        open: false,
        proxy: 'localhost:' + config.server.socket,
        serveStatic: [
          {
            route: '/code',
            dir: ['./code', './public/code']
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
          },

          {
            route: '/files',
            dir: ['./mocks']
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
}
