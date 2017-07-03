const FortifiedMap = require('common/support/fortified_map')

const fs = require('server/support/fs')

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

    constructor(stream, size, mimeType) {
        this.stream = stream
        this.size = size
        this.mimeType = mimeType
    }

    async getSize() {
        if (this.size !== null)
            return this.size

        return new Promise(function (resolve, reject) {
            this.stream.on('size', resolve)
            this.stream.on('error', reject)
        }.bind(this))
    }
}
