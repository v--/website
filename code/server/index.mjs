/* eslint-env node */

import Interface, { IString } from '../common/support/interface'

import HTTPServer from './http/server'
import { readFile } from './support/fs'

const IConfig = Interface.create({
    server: Interface.create({
        socket: IString
    }),

    db: Interface.create({
        fileRootPath: IString,
        pacmanDBPath: IString
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
