import BrowserSync from 'browser-sync'

export function initBrowserSync(socket: string | number): BrowserSync.BrowserSyncInstance {
  const instance = BrowserSync.create()
  instance.init({
    open: false,
    proxy: 'localhost:' + socket,
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

  return instance
}
