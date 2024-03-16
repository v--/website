import { readFile } from 'fs/promises'

import { HTTPServer } from './http/server.js'
import { IconSpec, iconMap } from '../common/components/icon.js'

const CONFIG_FILE = './config/active.json'
const ICON_FILE = './public/icons.json'

/**
 * @param {string} path
 */
async function readJSON(path) {
  return JSON.parse(await readFile(path, 'utf8'))
}

/**
 * @param { TServer.IWebsiteConfig } config
 */
readJSON(CONFIG_FILE).then(async function(config) {
  const server = new HTTPServer(config)
  await server.start()

  process.on('SIGUSR2', async function() {
    server.logger.info('Received signal SIGUSR2. Reloading server.')
    await server.reload(await readJSON(CONFIG_FILE))
  })

  for (const signal of ['SIGINT', 'SIGTERM', 'SIGQUIT']) {
    process.on(signal, async function() {
      if (server.state === 'running') {
        server.logger.info(`Received signal ${signal}. Shutting down server.`)
        await server.stop(signal)
      }
    })
  }
})

readJSON(ICON_FILE).then(
  /**
   * @params {Record<string, string>} icons
   */
  function(icons) {
    for (const [name, icon] of Object.entries(icons)) {
      iconMap.set(name, icon as IconSpec)
    }
  },

  function() {
    // no icons
  }
)
