/* eslint-env node */

import HTTPServer from './http/server.mjs'
import { readFile } from './support/fs.mjs'

async function readConfig () {
  return JSON.parse(await readFile('./config/active.json'))
}

readConfig().then(async function (config) {
  const server = new HTTPServer(config)
  await server.start()

  process.on('SIGUSR2', async function () {
    server.logger.info('Received signal SIGUSR2. Reloading server.')
    await server.reload(await readConfig())
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
