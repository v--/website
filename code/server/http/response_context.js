const trivialConstructor = require('common/support/trivial_constructor');
const { fortify } = require('common/support/enumerize');
const index = require('common/components/index');

const fs = require('server/support/fs');
const render = require('server/render');

// These are only necessary for the files in public/, nginx should handle serving files in production
const MIMETypeMap = fortify({
    'js':  'application/javascript',
    'xml': 'application/xml',
    'txt': 'text/plain',
    'css': 'text/css',
    'svg': 'image/svg+xml',
    'png': 'image/png'
});

module.exports = class ResponseContext extends trivialConstructor('stream', 'size', 'mimeType') {
    static async forFile(path) {
        try {
            const stat = await fs.stat(path);

            if (stat.isFile()) {
                const ext = path.split('.').slice(1).join('.');

                return new ResponseContext(
                    fs.createReadStream(path),
                    stat.size,
                    MIMETypeMap[ext] || 'application/octet-stream'
                );
            }

            return null;
        } catch (e) {
            // Assume the error is the result of the file not existing and ignore it.
            return null;
        }
    }

    static async forView(view) {
        const stream = render(index, null, render(await view()));
        return new ResponseContext(stream, null, 'text/html');
    }

    async getSize() {
        if (this.size !== null)
            return this.size;

        return new Promise((resolve, reject) => {
            this.stream.on('size', resolve);
            this.stream.on('error', reject);
        });
    }
};
