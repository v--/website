const { join } = require('path')

const { NotFoundError } = require('common/errors')

const { stat, readdir } = require('server/support/fs')

module.exports = async function parseFilesDirectory(basePath, id) {
    const path = join(basePath, id.substr('files/'.length))
    const result = []
    let files

    try {
        files = await readdir(path, 'utf8')
    } catch (e) {
        if (e.code === 'ENOENT')
            throw new NotFoundError(id)
        else
            throw e
    }

    for (const name of files) {
        const childStat = await stat(join(path, name))

        result.push({
            name,
            type: childStat.isFile() ? 'file' : 'directory'
        })
    }

    return result
}
