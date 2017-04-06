const fs = require('server/support/fs');

const trivialConstructor = require('common/support/trivial_constructor');
const { fortify } = require('common/support/enumerize');

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
};
