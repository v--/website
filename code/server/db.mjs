import { startsWith } from '../common/support/strings'

import parsePacmanDatabase from './db/parse_pacman_database'
import parseFilesDirectory from './db/parse_files_directory'

export default class DB {
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
