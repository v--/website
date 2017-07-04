/* eslint-env node */

const Interface = require('common/support/interface')

const HTTPServer = require('server/http/server')
const { readFile } = require('server/support/fs')

const IConfig = Interface.create({
    server: Interface.create({
        socket: Interface.IString
    }),

    db: Interface.create({
        files: Interface.IString,
        pacman: Interface.IString
    })
})

async function readConfig() {
    const file = await readFile('./config/active.json')
    return IConfig.assert(JSON.parse(file))
}

readConfig().then(async function (config) {
    const server = new HTTPServer(config)
    await server.start()

    process.on('SIGUSR2', async function () {
        server.logger.info('Received signal SIGUSR2. Reloading server.')
        await server.reload(await readConfig())
    })

    for (const signal of ['SIGINT', 'SIGTERM', 'SIGQUIT'])
        process.on(signal, async function () {
            if (server.state === HTTPServer.State.get('running')) {
                server.logger.info(`Received signal ${signal}. Shutting down server.`)
                await server.stop(signal)
            }
        })
})
