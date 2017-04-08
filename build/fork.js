const { fork } = require('child_process');

module.exports = class Fork {
    constructor(path, options = {}) {
        this.path = path;
        this.options = options;
        this.instance = null;
    }

    start() {
        this.instance = fork('code/server/index', this.options);
        this.instance.on('exit', () => {
            this.instance = null;
        });
    }

    kill() {
        if (!this.instance)
            return Promise.resolve();

        return new Promise((resolve, reject) => {
            this.instance.on('exit', resolve);
            this.instance.on('error', reject);
            this.instance.kill('SIGKILL');
        });
    }

    async restart() {
        await this.kill();
        this.start();
    }
};
