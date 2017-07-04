/* eslint-env node */

const HTTPServer = require('server/http/server')
const { readFile } = require('server/support/fs')

readFile('./config/active.json').then(async function (file) {
    const config = JSON.parse(file)
    const server = new HTTPServer(config.server.socket)

    server.start().then(function () {
        for (const signal of ['SIGINT', 'SIGTERM', 'SIGQUIT'])
            process.on(signal, function (signal) {
                if (server.state === HTTPServer.State.get('running'))
                    server.stop(signal)
            })
    })
})
