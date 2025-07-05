import { readConfig } from './config.ts'
import { HttpServer } from './http/server.ts'

const server = new HttpServer(await readConfig())

process.on('SIGUSR2', function () {
  server.logger.info('Received signal SIGUSR2. Reloading server.')

  readConfig()
    .then(async config => await server.reload(config))
    .catch(server.handleUnexectedError)
})

for (const signal of ['SIGINT', 'SIGTERM', 'SIGQUIT']) {
  process.on(signal, function () {
    if (server.getState() === 'running') {
      server.logger.info(`Received signal ${signal}. Shutting down server.`)
      server.stop(signal).catch(server.handleUnexectedError)
      server.finalize().catch(server.handleUnexectedError)
    }
  })
}

await server.start()
