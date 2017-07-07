const FortifiedMap = require('common/support/fortified_map')
const { chain } = require('common/support/itertools')
const { c } = require('common/component')

const index = require('server/components/index')

const StringBufferStream = require('server/support/string_buffer_stream')
const { createReadStream } = require('server/support/fs')
const { readFile } = require('server/support/fs')
const render = require('server/render')

// These are only necessary for the files in public/, nginx should handle serving files in production
const MIMETypeMap = FortifiedMap.fromObject({
    'js':  'application/javascript',
    'xml': 'application/xml',
    'txt': 'text/plain',
    'css': 'text/css',
    'svg': 'image/svg+xml',
    'png': 'image/png'
})

module.exports = class Response {
    static json(contents, code) {
        const stream = new StringBufferStream([JSON.stringify(contents)])
        return new this(stream, 'application/json', code)
    }

    static file(path, code) {
        const ext = path.split('.').slice(1).join('.')

        return new this(
            createReadStream(path),
            MIMETypeMap.get(ext, 'application/octet-stream'),
            code
        )
    }

    static view(state, code) {
        const component = c(index, {
            state: Object.assign({ collapsed: false, redirect() {} }, state),
            favicon: this.favicon
        })

        return new this(
            new StringBufferStream(chain('<!DOCTYPE html>', render(component))),
            'text/html',
            code
        )
    }

    static async load() {
        this.favicon = await readFile('public/images/favicon.png', 'base64')
    }

    constructor(stream, mimeType, code = 200) {
        this.stream = stream
        this.mimeType = mimeType
        this.code = code
    }
}
