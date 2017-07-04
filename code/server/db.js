const parsePacmanDatabase = require('server/support/parse_pacman_database')

module.exports = class DB {
    constructor(config) {
        this.config = config
    }

    async load() {
        this.packages = await parsePacmanDatabase(this.config.pacman)
    }

    async reload(config) {
        this.config = config
        await this.load()
    }

    async retrieve(dbID) {
        switch (dbID) {
        case 'pacman':
            return this.packages

        default:
            return null
        }
    }
}
