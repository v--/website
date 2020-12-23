import { readFile } from 'fs/promises'

import { HTTPServer } from './http/server.js'
import { HTTPServerState } from './enums/http_server_state.js'
import { iconMap } from '../common/components/icon.js'
import { IWebsiteConfig } from './config.js'

const CONFIG_FILE = './config/active.json'
const ICON_FILE = './public/icons.json'

async function readJSON(path: string) {
  return JSON.parse(await readFile(path, 'utf8'))
}

readJSON(CONFIG_FILE).then(async function(config: IWebsiteConfig) {
  const server = new HTTPServer(config)
  await server.start()

  process.on('SIGUSR2', async function() {
    server.logger.info('Received signal SIGUSR2. Reloading server.')
    await server.reload(await readJSON(CONFIG_FILE))
  })

  for (const signal of ['SIGINT', 'SIGTERM', 'SIGQUIT']) {
    process.on(signal, async function() {
      if (server.state === HTTPServerState.running) {
        server.logger.info(`Received signal ${signal}. Shutting down server.`)
        await server.stop(signal)
      }
    })
  }
})

readJSON(ICON_FILE).then(
  function(icons) {
    for (const [name, icon] of Object.entries(icons)) {
      iconMap.set(name, icon)
    }
  },

  function() {
    // no icons
  }
)
