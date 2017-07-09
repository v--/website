const { join } = require('path')

const { startsWith } = require('common/support/strings')
const { NotFoundError } = require('common/errors')

const { stat, readdir, readFile } = require('server/support/fs')

module.exports = async function parseFilesDirectory(basePath, id) {
    const path = join(basePath, id.substr('files/'.length))
    const result = {
        entries: [],
        readme: null
    }

    let files

    try {
        files = await readdir(path, 'utf8')
    } catch (e) {
        if (e.code === 'ENOENT' || e.code === 'ENOTDIR')
            throw new NotFoundError(id)
        else
            throw e
    }

    const parentStat = await stat(path)

    if (id !== 'files')
        result.entries.push({
            name: '..',
            type: 'directory',
            modified: parentStat.mtime,
            size: parentStat.size
        })

    for (const name of files) {
        const childStat = await stat(join(path, name))

        if (name === '.readme.md')
            result.readme = await readFile(join(path, name), 'utf8')

        if (startsWith(name, '.'))
            continue

        result.entries.push({
            name,
            type: childStat.isFile() ? 'file' : 'directory',
            modified: childStat.mtime,
            size: childStat.size
        })
    }

    return result
}
