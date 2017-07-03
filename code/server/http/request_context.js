const { HTTPError, NotFoundError } = require('common/errors')

const router = require('server/router')

module.exports = class RequestContext {
    constructor(request, response) {
        this.request = request
        this.response = response
    }

    async process() {
        try {
            const responseContext = await router(this.request.url)

            if (this.request.method === 'HEAD')
                await this.writeResponseHead(responseContext)
            else
                await this.writeResponseContext(responseContext)
        } catch (e) {
            if (e instanceof HTTPError)
                await this.writeHTTPError(e)
            else
                throw e
        }
    }

    async writeResponseContext(context) {
        const response = this.response

        return new Promise(function (resolve, reject) {
            context.stream.on('data', function (data) {
                response.write(data)
            })

            context.stream.on('error', function (err) {
                reject(err)
            })

            context.getSize().then(function (size) {
                response.writeHead(200, {
                    'Content-Type': context.mimeType,
                    'Content-Length': size
                })
            })

            context.stream.on('end', function () {
                response.end()
                resolve()
            })
        })
    }

    async writeResponseHead(context) {
        this.response.writeHead(200, {
            'Content-Type': context.mimeType
        })

        this.response.end()
    }

    async writeHTTPError(error) {
        this.response.writeHead(error.code)
        this.response.write(String(error))
        this.response.end()
    }

    async writeNotFound() {
        this.writeHTTPError(new NotFoundError())
    }
}
