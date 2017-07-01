const FortifiedMap = require('common/support/fortified_map')
const index = require('common/components/index')
const { c } = require('common/component')

const fs = require('server/support/fs')
const render = require('server/render')
const StringBufferStream = require('server/support/string_buffer_stream')

// These are only necessary for the files in public/, nginx should handle serving files in production
const MIMETypeMap = FortifiedMap.fromObject({
    'js':  'application/javascript',
    'xml': 'application/xml',
    'txt': 'text/plain',
    'css': 'text/css',
    'svg': 'image/svg+xml',
    'png': 'image/png'
})

module.exports = class ResponseContext {
    static async forFile(path) {
        try {
            const stat = await fs.stat(path)

            if (stat.isFile()) {
                const ext = path.split('.').slice(1).join('.')

                return new ResponseContext(
                    fs.createReadStream(path),
                    stat.size,
                    MIMETypeMap.get(ext, 'application/octet-stream')
                )
            }

            return null
        } catch (e) {
            // Assume the error is the result of the file not existing and ignore it.
            return null
        }
    }

    static async forView(view) {
        const component = c(index, null,
            c(view.component, { data: await view.fetchData() })
        )

        return new ResponseContext(
            new StringBufferStream(await render(component)),
            null,
            'text/html'
        )
    }

    constructor(stream, size, mimeType) {
        this.stream = stream
        this.size = size
        this.mimeType = mimeType
    }

    async getSize() {
        if (this.size !== null)
            return this.size

        return new Promise((resolve, reject) => {
            this.stream.on('size', resolve)
            this.stream.on('error', reject)
        })
    }
}
