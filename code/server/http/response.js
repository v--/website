const { chain } = require('common/support/iteration')
const { c } = require('common/component')

const index = require('server/components/index')

const StringBufferStream = require('server/support/string_buffer_stream')
const { readFile } = require('server/support/fs')
const render = require('server/render')

module.exports = class Response {
    static json(contents, code) {
        const stream = new StringBufferStream([JSON.stringify(contents)])
        return new this(stream, 'application/json', code)
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
