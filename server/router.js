const { join } = require('path');

const mime = require('mime-types');

const fs = require('server/support/fs');

class File {
    constructor(path, stat) {
        this.path = path;
        this.stat = stat;
    }

    exists() {
        return this.stat.isFile();
    }

    get status() {
        return 200;
    }

    get headers() {
        return {
            'Content-Type': mime.lookup(this.path),
            'Content-Length': this.stat.size
        };
    }

    read() {
        return fs.createReadStream(this.path);
    }
}

class ResponseFactory {
    static async first(...paths) {
        for (const path of paths) {
            const stat = await fs.stat(path);

            if (stat.isFile())
                return new File(path, stat);
        }

        return null;
    }
}

module.exports = async function router(request, response) {
    const file = await ResponseFactory.first(
        join('dist', 'public', request.url),
        'dist/views/index.html'
    );

    response.writeHead(file.status, file.headers);

    if (request.method === 'HEAD') {
        response.end();
    }

    file.read().pipe(response);
};
