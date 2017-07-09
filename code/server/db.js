const { startsWith } = require('common/support/strings')

const parsePacmanDatabase = require('server/db/parse_pacman_database')
const parseFilesDirectory = require('server/db/parse_files_directory')

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

    async retrieve(id) {
        if (id === 'pacman')
            return this.packages

        if (startsWith(id, 'files'))
            return await parseFilesDirectory(this.config.files, id)

        return null
    }
}
