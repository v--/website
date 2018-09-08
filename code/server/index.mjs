import HTTPServer from './http/server.mjs'
import { readFile } from './support/fs.mjs'
import { iconMap } from '../common/components/icon.mjs'

const CONFIG_FILE = './config/active.json'
const ICON_FILE = './public/icons.json'

async function readJSON (path) {
  return JSON.parse(await readFile(path))
}

readJSON(CONFIG_FILE).then(async function (config) {
  const server = new HTTPServer(config)
  await server.start()

  process.on('SIGUSR2', async function () {
    server.logger.info('Received signal SIGUSR2. Reloading server.')
    await server.reload(await readJSON(CONFIG_FILE))
  })

  for (const signal of ['SIGINT', 'SIGTERM', 'SIGQUIT']) {
    process.on(signal, async function () {
      if (server.state === HTTPServer.State.RUNNING) {
        server.logger.info(`Received signal ${signal}. Shutting down server.`)
        await server.stop(signal)
      }
    })
  }
})

readJSON(ICON_FILE).then(
  function (icons) {
    for (const [name, icon] of Object.entries(icons)) {
      iconMap.set(name, icon)
    }
  },

  function () {
    // no icons
  }
)
