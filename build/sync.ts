import { readFile } from 'fs/promises'
import BrowserSync from 'browser-sync'

const instance = BrowserSync.create()
const config = JSON.parse((await readFile('config/active.json')).toString('utf8'))

export const sync = {
  init(): void {
    instance.init({
      open: false,
      proxy: 'localhost:' + config.server.socket,
      serveStatic: [
        {
          route: '/code',
          dir: ['./dist']
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

  reload(): void {
    instance.reload()
  },

  stream(options?: BrowserSync.StreamOptions): NodeJS.ReadWriteStream {
    return instance.stream(options)
  },

  destruct(): void {
    instance.exit()
  }
}
